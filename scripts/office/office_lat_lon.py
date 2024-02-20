#!/usr/bin/python

import os
import sys
import time
import json
import pandas as pd

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

LEADS={}

db = Query()

o = db.query("""
    select 
        o.id,oa.zipcode 
    from 
        office o, office_addresses oa
    where
        o.id = oa.office_id and
        lat = 0
    
    """)

for x in o:
    print(x)
    zipc = x['zipcode']
    g = db.query("""
        select lat,lon
        from position_zip
        where zipcode = %s
        """,(zipc,)
    )
    if len(g) > 0:
        db.update("""
            update office_addresses set lat=%s,lon=%s
            where office_id=%s
            """,(g[0]['lat'],g[0]['lon'],x['id'])
        )
        db.commit()
