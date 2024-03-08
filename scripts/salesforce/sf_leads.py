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
        op.id,op.start_date,op.end_date,op.office_id,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id',opi.id,'price',opi.price,'description',opi.description,'quantity',opi.quantity
            )
        ) as items,pq.initial_payment,pd.price,pd.duration,u.email,u.first_name,u.last_name
    from 
        office_plans op,
        office o,
        users u,
        pricing_data pd,
        office_plan_items opi,
        provider_queue pq
    where 
        op.office_id = o.id and
        o.user_id = u.id and
        o.active = 1 and
        op.pricing_data_id = pd.id and
        opi.office_plans_id = op.id and
        pq.office_id = op.office_id 
    group by
        op.id
    """)
SCHEMA = {}
schema_f = 'sf_leads_schema.json'
data_f = 'sf_leads_data.json'
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
    print(x['name'])
    print(json.dumps(x,indent=4))
    print("----")
#H.open(schema_f,"w")
q = "select id,email from lead"
res = []
if os.path.exists(data_f):
    H=open(data_f,"r")
    SCHEMA = json.loads(H.read())
    H.close()
else:
    res = sf.query_all(q)
    H=open(data_f,"w")
    H.write(json.dumps(res,indent=4))
    H.close()
print(res)

