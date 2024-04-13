#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
from nameparser import HumanName

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs
from salesforce import sf_util

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
parser.add_argument('--limit', dest="limit", action="store")
parser.add_argument('--sf_id', dest="sf_id", action="store")
parser.add_argument('--painid', dest="painid", action="store")
args = parser.parse_args()
db = Query()

TYPE='Event'
sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)


if args.sf_id is not None and args.painid is not None:
    t = {}
    t['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),args.painid)
    t['PainID__c'] = args.painid
    try:
        sf.Lead.update(args.sf_id,t)
        db.update("""
            update provider_queue set sf_id = %s where id = %s
            """,(args.sf_id,args.painid)
        )
        db.commit()
    except Exception as e:
        print("ERROR: %s: %s" % (args.sf_id,str(e)))
    print("Successfully updated %s" % args.sf_id)
    sys.exit(0)

SCHEMA = {}
schema_f = 'sf_event_schema.json'
data_f = 'sf_event_data.json'
res = sf_util.cacheOrLoad(schema_f,sf.Event.describe)
SFSCHEMA = {}
ARR = []
for x in res['fields']:
    # print(x['name'])
    lab = x['label']
    SFSCHEMA[lab] = x
    ARR.append(x['name'])
    # print(json.dumps(x,indent=4))
    # print("----")

PSCHEMA = sf_util.getPainSchema(TYPE)
SFQUERY = "select  "
HAVE={}
for x in PSCHEMA:
    sc = PSCHEMA[x]
    col = sc['sf_field_name']
    # print(col)
    if col not in SFSCHEMA:
        print("WARNING: %s is missing" % col)
        continue
    if col in HAVE:
        print("WARNING: duplicate column %s" % col)
        continue
    HAVE[col] = 1
    sfcol = SFSCHEMA[col]
    # print(sfcol)
    # ARR.append(sfcol['name'])

SFQUERY += ','.join(ARR)
SFQUERY += " from Event "

SF_DATA = {}
res = []
if os.path.exists(data_f):
    print("Loading %s from disk" % data_f)
    H=open(data_f,"r")
    res = json.loads(H.read())
    H.close()
else:
    res = sf.query_all(SFQUERY)
    H=open(data_f,"w")
    H.write(json.dumps(res,indent=4))
    H.close()

for x in res['records']:
    # print(json.dumps(x,indent=4))
    SF_ID = x['Id']
    SF_DATA[SF_ID] = x
#---- MAIN

#print(res)
#print(type(res))
CNTR = 0

print('sz=%s' % len(SF_DATA))
for x in SF_DATA:
    j = SF_DATA[x]
    print(json.dumps(j,sort_keys=True,indent=4))
