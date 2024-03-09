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
        op.id as office_plans_id,pd.id as pricing_data_id,
        o.updated as office_updated,u.updated as users_updated,
        pq.updated as provider_queue_updated
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

random.shuffle(PAIN)
for x in PAIN:
    print(x)
    SF_ID = x['sf_id']
    OBJ = {}

    for y in PSCHEMA:
        if not PSCHEMA[y]['include_in_update']:
            continue
        SFFIELD= PSCHEMA[y]['sf_field_name']
        if y not in SFSCHEMA:
            continue
        print("PS:%s" % y)
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

        q = """
            select %s as s from %s where %s = %s %s
        """ % (field,table,join,val,filt)
        print("q=%s" % q)
        o = db.query(q)
        print("o=%s" %o)
        if len(o) < 1:
            OBJ[SFCOLNAME] = ''
        else:
            if 'URL' in SFCOLNAME:
                OBJ[SFCOLNAME] = "%s/#/app/main/admin/registrations/%s" % (config.getKey("host_url"),o[0]['s'])
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
    if 'Company' in OBJ:
        if OBJ['Company'] is None or len(OBJ['Company']) == 0:
            OBJ['Company'] = 'Unknown'
    # Dont send back the ID to SF
    if 'Id' in OBJ:
        del OBJ['Id']
    print(json.dumps(OBJ,indent=4))

    if SF_ID in SF_DATA:
        print("synchronizing objects")
        print("SYNC: %s" % SF_ID)
        SF_CHANGE = False
        PA_CHANGE = False
        pdata = json.dumps(OBJ,sort_keys=True)
        tmp = json.loads(json.dumps(SF_DATA[SF_ID]))
        del tmp['Id']
        del tmp['attributes']
        s = tmp['LastModifiedDate'].split(".")
        tmp['LastModifiedDate'] = s[0] 
        print("p-lu: %s" % OBJ['LastModifiedDate'])
        print("s-lu: %s" % tmp['LastModifiedDate'])
        LEADER = None
        d1 = calcdate.sysParseDate(OBJ['LastModifiedDate'])
        d2 = calcdate.sysParseDate(tmp['LastModifiedDate'])
        print(d1,d2)
        if tmp['LastModifiedDate'] is None:
            LEADER = 'pain' 
        elif d1 > d2:
            LEADER = 'pain'
        elif d2 > d1:
            LEADER = 'sf'
        ### SYNC HERE
        if 'LastModifiedDate' in OBJ:
            del OBJ['LastModifiedDate']
        sdata = json.dumps(tmp,sort_keys=True)
        psha = encryption.getSHA256(pdata)
        ssha = encryption.getSHA256(sdata)
        if LEADER is None:
            print("No updates required")
        if LEADER == 'pain':
            print("Sync'ing to salesforce")
            r = sf.Lead.update(SF_ID,OBJ)
        #print("p=%s" % pdata)
        #print("s=%s" % sdata)
        #print("p-%s = sf-%s" % (psha,ssha))
        # Synchronize here
        pass
    else:
        print("creating object")
        if 'LastModifiedDate' in OBJ:
            del OBJ['LastModifiedDate']
        r = sf.Lead.create(OBJ)
        print(json.dumps(r,indent=4))
        off = x['office_id']
        db.update("""
            update provider_queue set sf_id=%s where office_id=%s
            """,(r['id'],off)
        )
        db.commit()

