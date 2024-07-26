#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
import bs4
import pandas as pd
import requests

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--lat', dest="lat", action="store")
parser.add_argument('--lng', dest="lng", action="store")
parser.add_argument('--city', dest="city", action="store")
parser.add_argument('--state', dest="state", action="store")
args = parser.parse_args()
db = Query()

def getWeatherDataCurrent(lat,lng):
    key = config.getKey("openweather_api_key")
    u = "https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s" % (lat,lng,key)
    r = requests.get(u)
    return json.loads(r.text)

js = getWeatherDataCurrent(args.lat,args.lng)

hour = datetime.utcnow().strftime("%Y-%m-%d%H")
uuid = encryption.getSHA256("%s%s%s%s" % args.lat,args.lng,args.city,args.state,hour)

db.update("""
    insert into weather_run (lat,lng,city,state,uuid)
        value (%s,%s,%s,%s)
    """,(args.lat,args.lng,args.city,args.state,uuid)
)

wid = db.query("select LAST_INSERT_ID()")
wid = wid[0]['LAST_INSERT_ID()']

print(js)

### Add to current here

db.commit()


