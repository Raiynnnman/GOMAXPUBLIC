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
import stripe
config = settings.config()
config.read("settings.cfg")

key = config.getKey("stripe_key")
stripe.api_key = key
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
args = parser.parse_args()

APT = getIDs.getAppointStatus()
INV = getIDs.getInvoiceIDs()
db = Query()
l = db.query("""
    select 
        o.name,o.id,u.email,o.name,
        u.phone,o.stripe_cust_id
    from 
        office o,
        users u
    where 
        o.user_id = u.id and
        o.active = 1 and
        (o.stripe_next_check is null or o.stripe_next_check < now()) and
        o.stripe_cust_id is not null
    """
)

CNT = 0
for x in l:
    try:
        r = stripe.Customer.retrieve(x['stripe_cust_id'])
        CHANGE = False
        name="%s-%s" % (x['name'],x['id'])
        if r['email'] != x['email']:
            CHANGE = True
        if r['name'] != name:
            CHANGE = True
        if r['phone'] != x['phone']:
            CHANGE = True
        if CHANGE:
            CNT += 1
            print("Modifying customer %s" % (x['id'],))
            stripe.Customer.modify(
                x['stripe_cust_id'],
                name=name,
                email=x['email'],
                phone=x['phone']
            )
    except Exception as e:
        print("ERROR: %s for user %s" % (str(e),x['stripe_cust_id']))

    db.update("""
        update office set stripe_next_check = date_add(now(),INTERVAL 1 day)
            where id = %s
        """,(x['id'],)
    )
    db.commit()

print("Processed %s records" % CNT)
