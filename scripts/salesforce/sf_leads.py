#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json

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
args = parser.parse_args()

sf = None
#if config.getKey("sf_test"):
sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')

db = Query()
PAINHASH = {}
PAIN = db.query("""
    select 
        o.id as office_id,u.id as user_id,pq.sf_id,
        op.id as office_plans_id,pd.id as pricing_data_id
    from 
        office o,
        users u,
        office_plans op,
        pricing_data pd,
        provider_queue pq
    where 
        o.user_id = u.id and
        pd.id = op.pricing_data_id and
        op.office_id = o.id and
        pq.office_id = o.id
    """)

for x in PAIN:
    if x['sf_id'] is not None:
        PAINHASH[x['sf_id']] = x

TYPE='Lead'

PSCHEMA = sf_util.getPainSchema(TYPE)

SCHEMA = {}
schema_f = 'sf_leads_schema.json'
data_f = 'sf_leads_data.json'
res = sf_util.cacheOrLoad(schema_f,sf.Lead.describe)
SFSCHEMA = {}
for x in res['fields']:
    print(x['name'])
    lab = x['label']
    SFSCHEMA[lab] = x
    print(json.dumps(x,indent=4))
    print("----")

SFQUERY = "select  "
HAVE={}
ARR = []
for x in PSCHEMA:
    sc = PSCHEMA[x]
    col = sc['sf_field_name']
    print(col)
    if col not in SFSCHEMA:
        print("WARNING: %s is missing" % col)
        continue
    if col in HAVE:
        print("WARNING: duplicate column %s" % col)
        continue
    HAVE[col] = 1
    sfcol = SFSCHEMA[col]
    print(sfcol)
    ARR.append(sfcol['name'])

SFQUERY += ','.join(ARR)
SFQUERY += " from Lead "
print(SFQUERY)

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


#---- FUNCTIONS

def gatherPAINData(field,table,join,val,filt):
    pass

#---- MAIN

SF_DATA = {}
print(res)
print(type(res))
for x in res['records']:
    print(json.dumps(x,indent=4))
    SF_ID = x['Id']
    SF_DATA[SF_ID] = x
    if SF_ID in PAINHASH:
        print(PAINHASH[SF_ID])
    break

sys.exit(0)

random.shuffle(PAIN)
for x in PAIN:
    print(x)
    SF_ID = x['sf_id']
    OBJ = {}

    for y in PSCHEMA:
        SFFIELD= PSCHEMA[y]['sf_field_name']
        if y not in SFSCHEMA:
            continue
        SFCOLNAME = SFSCHEMA[y]['name']
        field = PSCHEMA[y]['pain_field_name']
        table = PSCHEMA[y]['pain_table_name']
        filt = PSCHEMA[y]['pain_special_filter']
        join = PSCHEMA[y]['pain_join_col']
        val = x[join]

        if table == 'users' and join == 'user_id':
            join = 'id'
        if table == 'office' and join == 'office_id':
            join = 'id'
        if table == 'pricing_data' and join == 'pricing_data_id':
            join = 'id'

        print("PS:%s" % y)
        q = """
            select %s as s from %s where %s = %s %s
        """ % (field,table,join,val,filt)
        print("q=%s" % q)
        o = db.query(q)
        print("o=%s" %o)
        if len(o) < 1:
            OBJ[SFCOLNAME] = ''
        else:
            OBJ[SFCOLNAME] = o[0]['s']

        print("SFC: %s" % SFCOLNAME)
        print("----")
        
    if 'LastName' in OBJ:
        if OBJ['LastName'] is None or len(OBJ['LastName']) == 0:
            OBJ['LastName'] = 'Unknown'
    if 'FirstName' in OBJ:
        if OBJ['FirstName'] is None or len(OBJ['FirstName']) == 0:
            OBJ['FirstName'] = 'Unknown'
    # Dont send back the ID to SF
    if 'Id' in OBJ:
        del OBJ['Id']
    print(json.dumps(OBJ,indent=4))

    if SF_ID in SF_DATA:
        print("synchronizing objects")
        # Synchronize here
        pass
    else:
        print("creating object")
        r = sf.Lead.create(OBJ)
        print(json.dumps(r,indent=4))
        off = x['office_id']
        db.update("""
            update provider_queue set sf_id=%s where office_id=%s
            """,(r['id'],off)
        )
        db.commit()
    break


