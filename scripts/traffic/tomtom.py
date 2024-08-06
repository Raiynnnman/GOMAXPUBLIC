#!/usr/bin/python
import requests
import random
import os
import sys
import math
import time
import json
sys.path.append(os.getcwd())  # noqa: E402
from common import settings
from util import encryption,calcdate,getIDs
from traffic import traffic_util
import argparse
import requests
from util.DBOps import Query
from threading import Thread

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--usecache', dest="usecache", action="store_true")
parser.add_argument('--distance', dest="distance", action="store")
args = parser.parse_args()

distance = 250 # miles
if args.distance is not None:
    distance = int(args.distance)
CITIES=[]
TOGET={}

def offset(lat,lon,distance):
    # 111 kilometers / 1000 = 111 meters.
    # 1 degree of latitude = ~111 kilometers.
    # 1 / 1000 means an offset of coordinate by 111 meters.

    offset = distance * 1.6 / 1000
    latMax = lat + offset
    latMin = lat - offset

    # With longitude, things are a bit more complex.
    # 1 degree of longitude = 111km only at equator (gradually shrinks to zero at the poles)
    # So need to take into account latitude too, using cos(lat).

    lngOffset = offset * math.cos(lat * math.pi / 180.0)
    lngMax = lon + lngOffset
    lngMin = lon - lngOffset
    return (lngMin,latMin,lngMax,latMax)

db1 = Query()
l = db1.query("""
    select 
        id,
        city,
        state,
        0 as zipcode
    from 
        traffic_cities
    where disabled = 0
    UNION ALL
    select 
        id,
        city,
        state,
        zipcode
    from 
        traffic_zipcodes
    where disabled = 0
    """)
for x in l:
    CITIES.append({'id':x['id'],'city':x['city'],'state':x['state'],'zipcode':x['zipcode']})

CATS = {}
l = db1.query("""
    select id,name from traffic_categories
    """)
for x in l:
    CATS[x['name']] = x['id']

pollu = encryption.getSHA256()
pollid = 0
db1.update("""
    insert into traffic_poll_attempt (uuid) values (%s)
""",(pollu,))
l = db1.query("""
    select LAST_INSERT_ID()
    """)

for x in l:
    pollid = x['LAST_INSERT_ID()']

for x in CITIES:
    l = []
    if int(x['zipcode']) != 0:
        # print('zip',x['zipcode'])
        l = db1.query("""
            select lat,lon,zipcode from position_zip where zipcode=%s 
        """,(x['zipcode'],)
        )
    else:
        # print('city',x['city'],x['state'])
        l = db1.query("""
            select lat,lon,zipcode from position_zip where name=%s and code1=%s 
        """,(x['city'],x['state']))
    if len(l) < 1:
        print("ERROR: Missing data for %s" % x)
        print('city',x)
        continue
    random.shuffle(l)
    l = l[:20]
    for y in l:
        # print(l)
        i = "%s+%s" % (x['city'],y['zipcode'])
        TOGET[i] = y
        TOGET[i]['zipcode'] = y['zipcode']
        TOGET[i]['state'] = x['state']
        TOGET[i]['city'] = x['city']
        TOGET[i]['lat'] = y['lat']
        TOGET[i]['lon'] = y['lon']
        TOGET[i]['bounds'] = offset(y['lat'],y['lon'],distance)
        # print("https://linestrings.com/bbox/#%s,%s,%s,%s" % (
        #     TOGET[i]['bounds'][0],TOGET[i]['bounds'][1],
        #     TOGET[i]['bounds'][2],TOGET[i]['bounds'][3]
        # ))


KEY="TSC0s1caeUuqZE4Zyz1o5QyghM0yxnVf"
URL="api.tomtom.com"
FILT="{incidents{type,geometry{type,coordinates},properties{id,iconCategory,"\
     "magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,"\
     "length,delay,roadNumbers,timeValidity,probabilityOfOccurrence,numberOfReports"\
     "}}}"
TC=getIDs.getTrafficCategories()
VER=5
JS=[]
THREADS=4
THREAD_CTRL={}
WORKER_QUEUE=[]
C = 0
while C < THREADS:
    WORKER_QUEUE.append([])
    C += 1

def getTraffic(x,db):
    # print("Checking %s" % x)
    F="%s.json" % x
    F=F.replace(' ','_')
    BOX=[
        TOGET[x]['bounds'][0],TOGET[x]['bounds'][1],
        TOGET[x]['bounds'][2],TOGET[x]['bounds'][3]
    ]
    U="https://%s/traffic/services/%s/incidentDetails?key=%s&bbox=%s,%s,%s,%s&fields="\
      "%s&language=en-US&t=1111&timeValidityFilter=present" % (
        URL,VER,KEY,BOX[0],BOX[1],BOX[2],BOX[3],FILT
    )
    # print(U)
    if not os.path.exists(F):
        if args.usecache:
            raise Exception("usecache specified, but call required")
        r = requests.get(U)
        if r.status_code != 200:
            print("ERROR: %s" % r.text)
            return None
        if r.content is None:
            print("No data for %s" % F)
            print(r.body)
            return None
        H=open(F,"w")
        T=json.loads(r.content)
        H.write(json.dumps(T,indent=4,sort_keys=True))
        H.close()
    else:
        print("Loading data from existing file %s" % F)

    H=open(F,"r")
    R=H.read()
    JS = json.loads(R)
    H.close()
    traffic_util.importTraffic(
            db,JS,
            TOGET[x]['city'],
            TOGET[x]['state'],
            TOGET[x]['zipcode'],
            TOGET[x]['lat'],
            TOGET[x]['lon']
    )

def workerThread(i):
    i = int(i)
    print("%s: starting thread" % i)
    db = Query()
    while True:
        MYQUEUE = json.loads(json.dumps(WORKER_QUEUE[i]))
        WORKER_QUEUE[i] = []
        L = len(MYQUEUE)
        if L > 0:
            print("%s: Processing %s items" % (i,L))
            while len(MYQUEUE) > 0:
                x = MYQUEUE[0]
                MYQUEUE.pop(0)
                getTraffic(x,db)
                time.sleep(.5)
                print("%s: Items in CQ: %s, Items left: %s" % (i,len(MYQUEUE),len(WORKER_QUEUE[i])))
        if not THREAD_CTRL[i]['enable'] and len(WORKER_QUEUE[i]) > 0:
            print("%s: stopping thread after completion of %s items" % (i,len(WORKER_QUEUE[i])))
        elif not THREAD_CTRL[i]['enable']:
            print("%s: stopping thread" % i)
            return
    time.sleep(1)

C = 0
while C < THREADS:
    THREAD_CTRL[C] = {'enable': True, 'thread': Thread(target=workerThread, args=(str(C)))}
    THREAD_CTRL[C]['thread'].start()
    C += 1
    
C = 0
TOTAL = 0
for x in TOGET:
    if C >= THREADS:
        C = 0
    if TOTAL % 10 == 0:
        time.sleep(.5)
    WORKER_QUEUE[C].append(x)
    C += 1
    TOTAL += 1

time.sleep(30)

print("Finished queue, waiting for completion")
C = 0
while C < THREADS:
    THREAD_CTRL[C]['enable'] = False
    print("%s: Command stop sent, waiting" % C)
    THREAD_CTRL[C]['thread'].join()
    C += 1

