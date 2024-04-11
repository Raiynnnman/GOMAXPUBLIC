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
args = parser.parse_args()
db = Query()

TYPE='Lead'
sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)

o = db.query("""
    select pq.id,pq.sf_id from provider_queue pq,office o 
    where 
    pq.sf_id is not null and o.import_sf=1 and o.id=pq.office_id;
""")

SCHEMA = {}
schema_f = 'sf_leads_schema.json'
data_f = 'sf_leads_data.json'
res = sf_util.cacheOrLoad(schema_f,sf.Lead.describe)
SFSCHEMA = {}
for x in res['fields']:
    # print(x['name'])
    lab = x['label']
    SFSCHEMA[lab] = x
    # print(json.dumps(x,indent=4))
    # print("----")

PSCHEMA = sf_util.getPainSchema(TYPE)
SFQUERY = "select  "
HAVE={}
ARR = []
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
    ARR.append(sfcol['name'])

SF_IDS = {}
o = db.query("""
    select email,sf_id from users where sf_id is not null
    """)
for x in o:
    SF_IDS[x['sf_id']] = x['email']

ARR.append('Notes__c')
ARR.append('Status')
ARR.append('LastModifiedById')
SFQUERY += ','.join(ARR)
SFQUERY += " from Lead "

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

#---- MAIN

SF_DATA = {}
#print(res)
#print(type(res))
CNTR = 0
PHONES = {}
for x in res['records']:
    # print(json.dumps(x,indent=4))
    SF_ID = x['Id']
    if 'attributes' in x:
        del x['attributes']
    SF_DATA[SF_ID] = x
    p = x['Phone']
    if p is None:
        p = x['Email']
    if p is None:
        continue
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p not in PHONES:
        PHONES[p] = []
    PHONES[p].append({
        'Id':x['Id'],
        'u':'https://poundpain.lightning.force.com/lightning/r/Lead/%s/view' % x['Id']
    })


for x in PHONES:
    if len(PHONES[x]) < 2:
        continue
    LST = []
    KEEP = []
    for y in PHONES[x]:
        i = y['Id']
        print("%s : %s : %s" % (x,len(PHONES[x]),json.dumps(SF_DATA[i])))
        j = SF_DATA[i]
        if j['Status'] != 'New':
            KEEP.append(i)
        else:
            LST.append(i)
        if j['Notes__c'] is not None and len(j['Notes__c']) > 0:
            KEEP.append(i)
        v = SF_IDS[j['LastModifiedById']]
        print("v=%s" % v)
    print("KEEP: %s" % KEEP)
    print("LST: %s" % LST)
    LST.pop()
    for x in LST:
        if x not in KEEP:
            print("Deleting %s" % x)
            # sf.Lead.delete(x)
    break


