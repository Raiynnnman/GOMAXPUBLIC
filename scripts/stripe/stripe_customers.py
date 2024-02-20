#!/usr/bin/python

import os
import sys
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
        u.id,u.first_name,u.last_name,u.email,u.phone
    from 
        users u
    where 
        u.id in (
            select user_id from entitlements e,user_entitlements eu
            where eu.entitlements_id=e.id and e.name='Customer'
        ) and
        u.stripe_customer_id is null
    """
)

for x in l:
    user_id = x['id']
    try:
        r = stripe.Customer.create(
            description="User %s" % x['email'],
            email=x['email'],
            metadata={'user_id':user_id},
            phone=x['phone'],
            name=x['first_name'] + " " + x['last_name']
        )
        db.update("update users set stripe_customer_id=%s where id=%s",
            (r['id'],user_id)
        )
        db.commit()
    except Exception as e:
        print("ERROR: %s has an issue: %s" % (x['email'],str(e)))
