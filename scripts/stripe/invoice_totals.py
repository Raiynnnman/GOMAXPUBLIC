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

INV = getIDs.getInvoiceIDs()
PQS = getIDs.getProviderQueueStatus()
db = Query()
l = db.query("""
    select invoices_id,sum(price*quantity) as calc,i.id,i.total
        from 
        invoices i,
        invoice_items ii
    where 
        i.id = ii.invoices_id and
        date_add(i.created,interval 160 day) > now() 
    group by 
        invoices_id
    """)

for x in l:
    if x['total'] != x['calc']:
        db.update("""
            update invoices set total = %s where id = %s
            """,(x['invoices_id'],x['calc'])
        )

db.commit()

