#!/usr/bin/python

import os
import sys
import jwt

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
import argparse


config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--email', dest="email", action="store")
args = parser.parse_args()
db = Query()

o = db.query("""
    select id,email from users where email=%s
    """,(args.email,)
)

if len(o) < 1:
    print("ERROR: User doesnt exist")
    sys.exit(1)

o = o[0]

d = { 
    "email":o['email'].lower(),
    "user_id":o['id']
} 
enc = jwt.encode(d,config.getKey("encryption_key"),algorithm="HS256")
db.update("""
    insert into user_api_keys(
        api_value,user_id,expires
    ) values (%s,%s,date_add(now(),interval 1 year))
    """,(enc.decode('utf-8'),o['id'],)
)
db.commit()
print(enc.decode('utf-8'))
