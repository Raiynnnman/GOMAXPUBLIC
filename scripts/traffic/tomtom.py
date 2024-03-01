#!/usr/bin/python
import requests
import os
import sys
import math
import time
import json
sys.path.append(os.getcwd())  # noqa: E402
from common import settings
from util import encryption,calcdate,getIDs
import argparse
import requests
from util.DBOps import Query

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

db = Query()
l = db.query("""
    select 
        id,
        city,
        state,
        0 as zipcode
    from 
        traffic_cities
    UNION ALL
    select 
        id,
        city,
        state,
        zipcode
    from 
        traffic_zipcodes
    """)
for x in l:
    CITIES.append({'id':x['id'],'city':x['city'],'state':x['state'],'zipcode':x['zipcode']})

CATS = {}
l = db.query("""
    select id,name from traffic_categories
    """)
for x in l:
    CATS[x['name']] = x['id']

pollu = encryption.getSHA256()
pollid = 0
db.update("""
    insert into traffic_poll_attempt (uuid) values (%s)
""",(pollu,))
l = db.query("""
    select LAST_INSERT_ID()
    """)
for x in l:
    pollid = x['LAST_INSERT_ID()']


for x in CITIES:
    # print(x)
    l = []
    if x['zipcode'] != 0:
        l = db.query("""
            select lat,lon,zipcode from position_zip where zipcode=%s limit 5
        """,(x['zipcode'],)
        )
    else:
        l = db.query("""
            select lat,lon,zipcode from position_zip where name=%s and code1=%s limit 5
        """,(x['city'],x['state']))
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
NEW=0
SKIP=0
for x in TOGET:
    F="%s.json" % x
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
        r = requests.get(U)
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

    for z in JS['incidents']:
        # print(json.dumps(z,indent=4))
        # print("---")
        # print(json.dumps(x,indent=4))
        uuid = encryption.getSHA256()
        incid = 0
        HAVE=False
        props = z['properties']
        # print(json.dumps(props,indent=4))
        l = db.query("""
            select id from traffic_incidents where vendor_id = %s
            """,(props['id'],)
        )
        for h in l:
            HAVE=True
        if HAVE:
            # print("already loaded incident %s" % props['id'])
            SKIP += 1
            continue
        NEW += 1
        cat = TC[props['iconCategory']]
        db.update("""
            insert into traffic_incidents (
                uuid,traf_delay,traf_end_time,traf_from,
                traffic_categories_id,vendor_id,traf_len,
                traf_magnitude,traf_num_reports,probability,
                traf_start_time,traf_to,city,state,zipcode,
                lat,lon
            ) values (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,%s
            )
        """,(
            uuid,props['delay'],props['endTime'],props['from'],
            cat,props['id'],props['length'],
            props['magnitudeOfDelay'],
            props['numberOfReports'] if props['numberOfReports'] is not None else 0,
            props['probabilityOfOccurrence'], props['startTime'],
            props['to'],TOGET[x]['city'],TOGET[x]['state'],TOGET[x]['zipcode'],
            TOGET[x]['lat'],TOGET[x]['lon']
        ))
        l = db.query("""
            select LAST_INSERT_ID()
            """)
        incid = l[0]['LAST_INSERT_ID()']
        order = 0
        for t in z['geometry']['coordinates']:
            db.update("""
               insert into traffic_coordinates (
                traffic_incidents_id,lon,lat,ord ) values (
                    %s,%s,%s,%s
                )
            """,(incid,t[0],t[1],order))
            order += 1
    db.commit()   

print("Added %s, skipped %s" % (NEW, SKIP))
