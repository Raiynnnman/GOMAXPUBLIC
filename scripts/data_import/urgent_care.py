#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
import pandas as pd
from common import settings
from util import encryption,calcdate
from util import getIDs

import argparse
import stripe
config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

if args.file is None:
    print("ERROR: Subs File required")
    sys.exit(1)

if not os.path.exists(args.file):
    print("ERROR: Subs File missing")
    sys.exit(1)

ST = getIDs.getLeadStrength()
BS = getIDs.getBillingSystem()
OT = getIDs.getOfficeTypes()
PQ = getIDs.getProviderQueueStatus()
db = Query()

df = pd.read_excel(args.file)
df = df.fillna(0)
df = df.to_dict(orient='index')

OFF = {}
for x in df:
    j = df[x]
    i = encryption.getSHA256(j['Company Name'].lower())
    if i not in OFF:
        OFF[i] = { 
            'addr':[],
            'website': j['Website'],
            'revenues': 0,
            'emps': j['Employees']
        } 
    OFF[i]['name'] = j['Company Name']
    OFF[i]['addr'].append({
        'phone':j['Company HQ Phone'],
        'addr1':j['Company Street Address'],
        'name': j['Company Name'],
        'city':j['Company City'],
        'state':j['Company State'],
        'zipcode':int(j['Company Zip Code'])
    })

for x in OFF:
    j = OFF[x]
    # print(json.dumps(j,indent=4))
    o = db.query("""
        select id from office where name = %s
        """,(j['name'],)
    )
    if len(o) > 0:
        print("already have %s" % j['name'])
        continue
    db.update("""
        insert into office (name,office_type_id,active,billing_system_id) 
            values (%s,%s,0,%s)
        """,(j['name'],OT['Urgent Care'],BS)
    )
    off_id = db.query("select LAST_INSERT_ID()")
    off_id = off_id[0]['LAST_INSERT_ID()']
    for g in j['addr']:
        db.update("""
            insert into office_addresses
                (office_id,addr1,phone,city,state,zipcode,name) 
                values 
                (%s,%s,%s,%s,%s,%s,%s)
            """,(
                off_id,
                g['addr1'],
                g['phone'],
                g['city'],
                g['state'],
                g['zipcode'],
                g['name']
                )
        )
    db.update("""
        insert into provider_queue(
                office_id,provider_queue_status_id,provider_queue_lead_strength_id,
                website,employees_range,annual_sales
            ) 
            values (%s,%s,%s,%s,%s,%s)
        """,(
            off_id,PQ['QUEUED'],ST['Potential Provider'],
            j['website'],j['emps'],j['revenues']
            )
        )
    PQ_ID = db.query("select LAST_INSERT_ID()")
    PQ_ID = PQ_ID[0]['LAST_INSERT_ID()']
    db.commit()
