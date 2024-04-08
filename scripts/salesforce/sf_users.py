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
parser.add_argument('--sf_id', dest="sf_id", action="store")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)

TYPE='Account'
PSCHEMA = sf_util.getPainSchema(TYPE)

db = Query()

SCHEMA = {}
schema_f = 'sf_user_schema.json'
data_f = 'sf_user_data.json'
res = sf_util.cacheOrLoad(schema_f,sf.User.describe)
SFSCHEMA = {}
FIELDS = []
for x in res['fields']:
    print(x['label'])
    FIELDS.append(x['name'])
    lab = x['label']
    SFSCHEMA[lab] = x
    # print(json.dumps(x,indent=4))
    # print("----")

SFQUERY = "select  "
SFQUERY += ','.join(FIELDS)
SFQUERY += " from User "

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
    if 'uatpart' in x['Username']:
        x['Username'] = x['Username'].replace(".uatpart","")
    if x['Username'] == "admin@poundpain.com":
        x['Username'] = "rain@poundpain.com"
    o = db.query("""
        select id,sf_id from users where email = %s
        """,(x['Username'].lower(),)
    )
    if len(o) < 1:
        print("User %s doesnt have a platform account" % x['Username'])
        continue 
    if o[0]['sf_id'] is not None:
        continue
    db.update("""
        update users set sf_id = %s where id = %s
        """,(x['Id'],o[0]['id'])
    )
    print("Updated id for %s" % x['Username'])

db.commit()

