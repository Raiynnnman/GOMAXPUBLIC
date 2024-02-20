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
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")

key = config.getKey("stripe_key")
stripe.api_key = key
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
args = parser.parse_args()

db = Query()
l = db.query("""
        select
            o.id,name,active,stripe_connect_id
        from
            office o
        left outer join office_addresses oa on oa.office_id=o.id
        where 
            o.accepted_tos = 0
        group by
            o.id
    """)
t = db.query("""
        select
            c.id,stripe_connect_id
        from
            consultant c
        where 
            c.accepted_tos = 0
    """)

for x in l:
    print(x)
    if x['stripe_connect_id'] is None:
        continue
    g = datetime.utcnow() - timedelta(days=1)
    stripe.Account.modify(
      x['stripe_connect_id'],
      tos_acceptance={
        "date": g.strftime("%s"), 
        "ip": "8.8.8.8"
        }
    )
    db.update("update office set accepted_tos=1 where id=%s",(x['id'],))
    db.commit()

for x in t:
    print(x)
    if x['stripe_connect_id'] is None:
        continue
    g = datetime.utcnow() - timedelta(days=1)
    stripe.Account.modify(
      x['stripe_connect_id'],
      tos_acceptance={
        "date": g.strftime("%s"), 
        "ip": "8.8.8.8"
        }
    )
    db.update("update consultant set accepted_tos=1 where id=%s",(x['id'],))
    db.commit()
