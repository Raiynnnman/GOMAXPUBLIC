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
        o.name,o.id,o.email
    from 
        office o
    where 
        o.active = 1 and
        o.stripe_cust_id is null
    """
)

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

print("Processed %s records" % CNT)
