#!/usr/bin/python

import os
import sys
import time
import json
import pandas as pd
import googlemaps
from datetime import datetime

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
import argparse
import requests
from util.DBOps import Query
from util.Mail import Mail
from bs4 import BeautifulSoup
from selenium import webdriver 
from selenium.webdriver import Chrome 
from selenium.webdriver.chrome.service import Service 
from selenium.webdriver.common.by import By 
from webdriver_manager.chrome import ChromeDriverManager


config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
parser.add_argument('--use-cache', dest="usecache", action="store_true")
args = parser.parse_args()

api_key=config.getKey("google_api_key")
gmaps = googlemaps.Client(key=api_key)

db = Query()

o = db.query("""
    select 
        oa.id,oa.zipcode,oa.state,oa.city,addr1
    from 
        office_addresses oa
    where
        lat = 0
    """)

for x in o:
    res = gmaps.geocode('%s, %s, %s' % (x['addr1'],x['city'],x['state']))
    if len(res) < 1:
        print("Unable to find coordinates for %s" % x['id'])
        continue
    res = res[0]
    #print(json.dumps(res,indent=4))
    #print("=----")
    #print(json.dumps(res['geometry'],indent=4))
    lat = res['geometry']['location']['lat']
    lon = res['geometry']['location']['lng']
    db.update("""
        update office_addresses set lat=%s,lon=%s
        where id=%s
        """,(lat,lon,x['id'])
    )
    db.commit()
