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
parser.add_argument('--sfonly', dest="sfonly", action="store_true")
parser.add_argument('--sf_id', dest="sf_id", action="store")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

OT = getIDs.getOfficeTypes()

sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)

TYPE='Account'
PSCHEMA = sf_util.getPainSchema(TYPE)

db = Query()

PAIN = db.query("""
    select 
        o.id as office_id,oa.id as oa_id,concat(oa.addr1, ' ',oa.addr2) as addr1,
        oa.city,oa.zipcode,oa.state,oa.sf_id,o.id,o.sf_parent_id,
        op.id as office_plans_id,pd.id as pricing_data_id,o.name as office_name,
        o.updated as office_updated,oa.updated as updated
    from 
        office_addresses oa
        left outer join office o on oa.office_id = o.id
        left outer join office_plans op on  op.office_id = o.id
        left outer join pricing_data pd on pd.id = op.pricing_data_id
    where 
        o.active = 1 
        and o.office_type_id in (%s,%s)
    """,(OT['Chiropractor'],OT['Urgent Care'])
)

SCHEMA = {}
schema_f = 'sf_account_schema.json'
data_f = 'sf_account_data.json'
res = sf_util.cacheOrLoad(schema_f,sf.Account.describe)
SFSCHEMA = {}
FIELDS = []
for x in res['fields']:
#    # print(x['label'])
#    FIELDS.append(x['name'])
    lab = x['label']
    SFSCHEMA[lab] = x
#    # print(json.dumps(x,indent=4))
#    # print("----")

for x in PSCHEMA:
    FIELDS.append(SFSCHEMA[x]['name'])

SFQUERY = "select  "
SFQUERY += ','.join(FIELDS)
SFQUERY += " from Account "

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

SF_DATA = {}
for x in res['records']:
    SF_ID = x['Id']
    if 'attributes' in x:
        del x['attributes']
    SF_DATA[SF_ID] = x

if args.sfonly:
    PAIN = []

CNTR = 0
random.shuffle(PAIN)
PARENTS={}
for x in PAIN:
    # print(x)
    SF_ID = x['sf_id']
    SF_ROW = None
    if SF_ID in SF_DATA:
        SF_ROW = SF_DATA[SF_ID]

    if SF_ID is not None and SF_ROW is None:
        print("ERROR: Cached results found, skipping %s" % x['sf_id'])
        continue

    if x['office_id'] in PARENTS:
        x['sf_parent_id'] = PARENTS[x['office_id']]

    SF_PARENT = x['sf_parent_id']
    if SF_PARENT is None:
        r = sf.Account.create({
            SFSCHEMA['PainID']['name']: x['office_id'],
            SFSCHEMA['IsParent']['name']: True,
            SFSCHEMA['IsActive']['name']: True,
            SFSCHEMA['Account Name']['name']:x['office_name']
            })
        db.update("""
            update office set sf_id = %s where id = %s
            """,(r['id'],x['office_id'])
        )
        PARENTS[x['office_id']] = r['id']
        x['sf_parent_id'] = r['id']
    (update,newdata) = sf_util.synchronizeData(x,SF_ROW,SFSCHEMA,PSCHEMA,db)
    #print("----")
    #print(json.dumps(newdata,indent=4))
    #print("----")

    SAME = sf_util.compareDicts(newdata,SF_ROW)
    
    if update == 1 and not SAME: # Update SF
        if 'Id' in newdata and newdata['Id'] is not None:
            print("updating SF record: %s" % newdata['Id'])
            # r = sf.Account.update(newdata)
        else:
            del newdata['Id']
            print("creating SF record:%s " % x['office_name'])
            try:
                r = sf.Account.create(newdata)
                db.update("""
                    update office_addresses set sf_id = %s where id = %s
                    """,(r['id'],x['oa_id'])
                )
            except Exception as e:
                print(str(e))
                print(json.dumps(newdata,indent=4))
                continue
    elif update == 0 and not SAME:
        print("Updating PAIN")
    else:
        print("No changes required")
    db.commit()
    CNTR += 1
    if args.limit is not None:
        if CNTR > int(args.limit):
            break

schema_f = 'sf_leads_schema.json'
leads = sf_util.cacheOrLoad(schema_f,sf.Lead.describe)
COLS = {}
for x in leads['fields']:
    COLS[x['name']] = 1

LIST=['LastModifiedDate', 'Address', 'LastReferencedDate', 'Name', 
    'CreatedById', 'PhotoUrl', 'MasterRecordId', 'IsDeleted', 
    'LastViewedDate', 'SystemModstamp', 'CreatedDate', 
    'LastActivityDate', 'LastModifiedById']

CNTR = 0
# print(json.dumps(SF_DATA,indent=4))
for x in SF_DATA:
    j = SF_DATA[x]
    act = SFSCHEMA['IsActive']['name']
    if not j[act]:
        print("Moving %s to leads" % j['Id'])
        n = {}
        for x in j:
            if 'Billing' in x:
                v = x.replace("Billing",'')
                n[v] = j[x]
            elif x == 'Name':
                n['Company'] = j[x]
            elif x not in COLS:
                pass
            elif x in LIST:
                pass
            else:
                n[x] = j[x]
        if 'Address' in n:
            del n['Address']
        n['LastName'] = 'Unknown'
        # print(json.dumps(n,indent=4))
        del n['Id']
        r = sf.Lead.create(n,headers={'Sforce-Duplicate-Rule-Header': 'allowSave=true'})
        sf.Account.delete(j['Id'])
    CNTR += 1
    if args.limit is not None:
        if CNTR > int(args.limit):
            break

