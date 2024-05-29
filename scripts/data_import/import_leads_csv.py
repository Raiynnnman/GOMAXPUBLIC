#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
import bs4
import requests

sys.path.append(os.getcwd())  # noqa: E402

from salesmate import sm_util
from salesmate.sm_util import SM_Contacts,SM_Companies,SM_Deals
from util.DBOps import Query
import pandas as pd
from common import settings
from util import encryption,calcdate
from util import getIDs

from nameparser import HumanName
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--file', dest="file", action="store")
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--no_commit', dest="no_commit", action="store_true")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

if args.file is None:
    print("ERROR: Subs File required")
    sys.exit(1)

if not os.path.exists(args.file):
    print("ERROR: Subs File missing")
    sys.exit(1)

CONTACT_OBJ = SM_Contacts()
COMPANY_OBJ = SM_Companies()
ST = getIDs.getLeadStrength()
BS = getIDs.getBillingSystem()
OT = getIDs.getOfficeTypes()
PQ = getIDs.getProviderQueueStatus()
db = Query()

df = pd.read_excel(args.file)
df = df.fillna('')
df = df.to_dict(orient='index')

HAVES = {}
OFF = {}
CNTR = 0
DUPS = 0
COMPANIES = sm_util.getCompanies(debug=args.debug)
CONTACTS = sm_util.getContacts(debug=args.debug)

PHONES = {}
for j in CONTACTS:
    x = CONTACTS[j]
    # print("x=%s" % x)
    p = str(x['phone'])
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p.startswith("+1"):
        p = p.replace("+1","")
    if p.startswith("1") and len(p) == 11:
        p = p[1:]
    PHONES[p] = 1

CNTR = 0
for x in df:
    j = df[x]
    if j['phone'] is None or len(str(j['phone'])) < 1:
        continue
    if j['email'] is None or len(str(j['email'])) < 1:
        continue
    j['phone'] = str(j['phone'])
    if len(j['website']) > 0 and len(j['name']) < 1:
        j['name'] = "Unknown"
        if 'https://' not in j['website']:
            j['website'] = 'https://' + j['website']
        r = requests.get(j['website'],headers={'user-agent':'curl/7.81.0'},timeout=30)
        html = bs4.BeautifulSoup(r.text)
        title = str(html.title)
        if title is not None:
            # print("t=%s" % title)
            title = title.replace("<title>","").replace("</title>","").replace("Home - ","")
            if '|' in title:
                title = title.split("|")[0]
            if ' - ' in title:
                title = title.split(" - ")[0]
            j['name'] = title
    # print("name=%s" % j['name'])
    if len(j['name']) < 1:
        j['name'] = "Unknown"
    if '@' not in j['email']:
        j['email'] = j['email'] + "@unknown.com"
    j['email'] = j['email'].replace(" ","").replace(",","")
    print(j)
    p = j['phone']
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p.startswith("+1"):
        p = p.replace("+1","")
    if p.startswith("1") and len(p) == 11:
        p = p[1:]
    if p in PHONES:
        print("Already have %s" % j['email'])
        continue
    j['phone'] = p
    if j['name'] is None or len(j['phone']) < 1:
        j['name'] = "Unknown"
    j['first'] = "Unknown"
    j['last'] = "Unknown"
    comp = {
        'company': j['email'],
        'website': j['website'],
        'name': j['name'],
        'tags': 'Import Jure',
        'phone': j['phone']
    } 
    r = COMPANY_OBJ.update(comp,dryrun=args.no_commit,raw=True)
    company_sm_id = r['id']
    contact = { 
        'email': j['email'],
        'company': company_sm_id,
        'firstName': j['first'],
        'lastName': j['last'],
        'tags': 'Import Jure',
        'phone': j['phone'],
        'website': j['website']
    } 
    r = CONTACT_OBJ.update(contact,dryrun=args.no_commit,raw=True)
    user_sm_id = r['id']
    CNTR += 1
    print("cntr=%s" % CNTR)
    if args.limit is not None and CNTR >= int(args.limit):
        break
