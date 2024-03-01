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
        o.stripe_cust_id is not null
    """
)

for x in l:
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
        print("Modifying customer %s" % (x['id'],))
        stripe.Customer.modify(
            x['stripe_cust_id'],
            name=name,
            email=x['email'],
            phone=x['phone']
        )
