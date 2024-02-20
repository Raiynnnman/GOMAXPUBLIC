#!/usr/bin/python
import requests
import os
import sys
import math
import time
import json
sys.path.append(os.getcwd())  # noqa: E402
from common import settings
from util import encryption,calcdate
import argparse
import requests
from util.DBOps import Query

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
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
    select id,city,state from traffic_cities
    """)
for x in l:
    CITIES.append({'id':x['id'],'city':x['city'],'state':x['state']})

for x in CITIES:
    print(x)
    l = db.query("""
        select lat,lon,zipcode from position_zip where name=%s and code1=%s limit 1
    """,(x['city'],x['state']))
    print(l)
    TOGET[x['city']] = x
    TOGET[x['city']]['zipcode'] = l[0]['zipcode']
    TOGET[x['city']]['lat'] = l[0]['lat']
    TOGET[x['city']]['lon'] = l[0]['lon']
    TOGET[x['city']]['bounds'] = offset(l[0]['lat'],l[0]['lon'],distance)
    print("https://linestrings.com/bbox/#%s,%s,%s,%s" % (
        TOGET[x['city']]['bounds'][0],TOGET[x['city']]['bounds'][1],
        TOGET[x['city']]['bounds'][2],TOGET[x['city']]['bounds'][3]
    ))

# print(TOGET)

KEY="TSC0s1caeUuqZE4Zyz1o5QyghM0yxnVf"
URL="api.tomtom.com"
FILT="{incidents{type,geometry{type,coordinates},properties{id,iconCategory,"\
     "magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,"\
     "length,delay,roadNumbers,timeValidity,probabilityOfOccurrence,numberOfReports"\
     "}}}"
VER=5
JS=[]
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
    if os.path.exists(F):
        H=open(F,"r")
        R=H.read()
        JS.append(json.loads(R))
        H.close()
        print("City %s already downloaded" % F)
        continue
    print(U)
    r = requests.get(U)
    print(r.content)
    JS.append(json.loads(r.content))
    H=open(F,"w")
    H.write(json.dumps(JS,indent=4,sort_keys=True))
    H.close()

for x in JS:
    print("here")
