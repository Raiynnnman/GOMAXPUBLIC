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
from salesmate.sm_util import SM_User
from salesforce import sf_util

import argparse

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--sm_id', dest="sm_id", action="store")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

TYPE='Account'
PSCHEMA = sf_util.getPainSchema(TYPE)

db = Query()

SCHEMA = {}
schema_f = 'sf_user_schema.json'
data_f = 'sf_user_data.json'
# res = sf_util.cacheOrLoad(schema_f,sf.User.describe)
user = SM_User()
user.setDebug(True)

res = []
if os.path.exists(data_f):
    print("Loading %s from disk" % data_f)
    H=open(data_f,"r")
    res = json.loads(H.read())
    H.close()
else:
    res = user.get(None,None)
    H=open(data_f,"w")
    H.write(json.dumps(res,indent=4))
    H.close()


for x in res:
    print(json.dumps(x,indent=4))
    if 'uatpart' in x['email']:
        x['email'] = x['email'].replace(".uatpart","")
    if x['email'] == "admin@poundpain.com":
        x['email'] = "rain@poundpain.com"
    o = db.query("""
        select id,sm_id from users where email = %s
        """,(x['email'].lower(),)
    )
    if len(o) < 1:
        print("User %s doesnt have a platform account" % x['email'])
        continue 
    if o[0]['sm_id'] == x['id']:
        continue
    j = db.query("""
        select id from users where sm_id=%s
        """,(x['id'],)
    )
    if len(j) > 0:
        db.update("""
            update users set sm_id = null where id = %s
            """,(j[0]['id'],)
        )
    db.update("""
        update users set sm_id = %s where id = %s
        """,(x['id'],o[0]['id'])
    )
    print("Updated id for %s" % x['email'])

db.commit()

