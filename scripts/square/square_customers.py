#!/usr/bin/python

import os
import sys
import traceback
import uuid
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate,getIDs
import argparse
from square.client import Client

config = settings.config()
config.read("settings.cfg")

key = config.getKey("square_api_key")
client = Client(access_token=key,environment='sandbox')

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
parser.add_argument('--id', dest="id", action="store")
args = parser.parse_args()
db = Query()

q = """
    select 
        o.name,o.id,o.email
    from 
        office o
    where 
        o.active = 1 and
        o.stripe_cust_id is null
    """

if not args.force and args.id is None:
    q += " and (o.stripe_next_check is null or o.stripe_next_check < now()) "

if args.id is not None:
    q += " and o.id = %s " % args.id

l = db.query(q)

BS=getIDs.getBillingSystem()

CNT = 0
for x in l:
    email = x['email']
    if config.getKey('email_to_override') is not None:
        email = config.getKey('email_to_override')
    CNT += 1
    try:
        r = {}
        if BS == 1:
            r = stripe.Customer.create(
                description="Customer %s-%s" % (x['name'],x['id']),
                email=email,
                metadata={'office_id':x['id']},
                name="%s-%s" % (x['name'],x['id'])
            )
            db.update("update office set stripe_cust_id=%s where id=%s",
                (r['id'],x['id'])
            )
        elif BS==2:
            r = client.customers.create_customer({
                'given_name': x['name'],
                'email_address':email,
                'idempotency_key': str(uuid.uuid4())            
            })
            r = r.body
            print(json.dumps(r,indent=4))
            db.update("update office set stripe_cust_id=%s where id=%s",
                (r['customer']['id'],x['id'])
            )
    except Exception as e:
        print("ERROR: %s has an issue: %s" % (x['email'],str(e)))
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
    db.update("""
        update office set stripe_next_check = date_add(now(),INTERVAL 1 day)
            where id = %s
        """,(x['id'],)
    )
    db.commit()

print("Processed %s records" % CNT)
