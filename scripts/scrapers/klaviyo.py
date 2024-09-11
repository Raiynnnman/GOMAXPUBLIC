#!/usr/bin/python

import os
import sys
import time
import json
import pandas as pd

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
from util import getIDs
import argparse
import requests
from util.DBOps import Query
from util.Mail import Mail
from util.HTMLParser import HTMLParser

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
parser.add_argument('--use-cache', dest="usecache", action="store_true")
args = parser.parse_args()

REF = getIDs.getReferrerUserStatus()

db = Query()
#l = db.query("""
#    select id,email,first_name,last_name,zipcode,phone from leads
#    """)
#for x in l:
#    h = encryption.getSHA256(json.dumps(x,sort_keys=True))
#    LEADS[h] = x


headers = {}
api = config.getKey("klaviyo_api")
headers['Authorization'] = "Klaviyo-API-Key %s" % api
headers['REVISION'] = '2023-12-15'

r = requests.get("https://a.klaviyo.com/api/campaigns/?filter=equals(messages.channel,'email')",headers=headers)
if r.status_code != 200:
    print("ERROR: %s" % r.text)
    sys.exit(1)

js = json.loads(r.text)

for x in js['data']:
    myid = x['id']
    r = requests.get("https://a.klaviyo.com/api/campaigns/%s/" % myid, headers=headers)
    if r.status_code != 200:
        print("ERROR: %s" % r.text)
        sys.exit(1)
    camp = json.loads(r.text)
    print(json.dumps(camp,indent=4))
    print("----")
    r = requests.get('https://www.klaviyo.com/ajax/message-statistics/01J73VSXVE0BSYAGF5APWQ87XS/reports/recipients/table?conversion_metric_id=Tqt2VF&count=25&list_type=all&sort=email&start=0',headers=headers)
    print(r.text)
    break
