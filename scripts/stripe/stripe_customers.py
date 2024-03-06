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
parser.add_argument('--force', dest="force", action="store_true")
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

if not args.force:
    q += " and (o.stripe_next_check is null or o.stripe_next_check < now()) "

l = db.query(q)

CNT = 0
for x in l:
    email = x['email']
    CNT += 1
    try:
        r = stripe.Customer.create(
            description="Customer %s-%s" % (x['name'],x['id']),
            email=email,
            metadata={'office_id':x['id']},
            name="%s-%s" % (x['name'],x['id'])
        )
        db.update("update office set stripe_cust_id=%s where id=%s",
            (r['id'],x['id'])
        )
        print("update office set stripe_cust_id=%s where id=%s" % 
            (r['id'],x['id'])
        )
        db.commit()
    except Exception as e:
        print("ERROR: %s has an issue: %s" % (x['email'],str(e)))
    db.update("""
        update office set stripe_next_check = date_add(now(),INTERVAL 1 day)
            where id = %s
        """,(x['id'],)
    )
    db.commit()

print("Processed %s records" % CNT)
