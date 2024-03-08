#!/usr/bin/python

import os
import sys
from datetime import datetime, timedelta
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs

import argparse
from simple_salesforce import Salesforce

config = settings.config()
config.read("settings.cfg")

user = config.getKey("sf_user")
passw = config.getKey("sf_pass")
token = config.getKey("sf_token")
inst = config.getKey("sf_instance")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
args = parser.parse_args()

sf = None
#if config.getKey("sf_test"):
sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')

db = Query()
l = db.query("""
    select 
        sf_field_name,sf_table_schema,pain_field_name,pain_table_name,pain_special_filter
    from 
        salesforce_mapping
    where
        sf_table_schema = 'Lead'
    """)
VALS = {}
for x in l:
    VALS[x['sf_field_name']] = x

schema_f = 'sf_leads_schema.json'
res = []
if os.path.exists(schema_f):
    H=open(schema_f,"r")
    res = json.loads(H.read())
    H.close()
else:
    res = sf.Lead.describe()
    H=open(schema_f,"w")
    H.write(json.dumps(res,indent=4))
    H.close()
    print(json.dumps(res,indent=4))

for x in res['fields']:
    if 'picklistValues' in x and len(x['picklistValues']) > 0:
        newpicklist = []
        print('%s has picklist values' % x['label'])
        print('values: %s' % json.dumps(x['picklistValues']))
        picklist = x['picklistValues']
        picklist_vals = {}
        for t in picklist:
            picklist_vals[t['label']] = t
        sf_field = x['label']
        name = x['name']
        print(sf_field)
        if sf_field in VALS:
            print("Have %s" % sf_field)
            co = mdapi.CustomObject(
                fullName = name
            )
            q = "select %s from %s %s" % (
                        VALS[sf_field]['pain_field_name'],
                        VALS[sf_field]['pain_table_name'],
                        VALS[sf_field]['pain_special_filter']
                    )
            
            print(q)
            r = db.query(q)
            for t in r:
                col = VALS[sf_field]['pain_field_name']
                if len(t[col]) < 1:
                    continue
                if t[col] not in picklist_vals:
                    print("%s not in picklist" % t[col])
                sf.mdapi.CustomObject.upsert(name, {'label': t[col], 'isActive': True })
            if len(newpicklist) > 0:
                print(newpicklist)
                print("g=%s" % g)
                break
            print("RES")
            print(r)



