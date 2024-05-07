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
parser.add_argument('--disable', dest="dryrun", action="store_true")
args = parser.parse_args()

APT = getIDs.getAppointStatus()
INV = getIDs.getInvoiceIDs()
BS = getIDs.getBillingSystem()
PQS = getIDs.getProviderQueueStatus()
db = Query()

l = db.query("""
    select 
        i.id,i.office_id,
        min(billing_period),datediff(now(),billing_period) as days
    from 
        invoices i,
        office o 
    where 
        i.office_id=o.id and 
        invoice_status_id=10 and 
        active=1 
    group by office_id;
    """
)
CNT = 0
for x in l:
    CNT += 1
    print(x)
    if x['days'] < 60:
        continue
    print("would disable %s" % x['office_id'])
    if not args.disable:
        continue
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(x['id'],1,'Disabling account (%s days past due)' % x['days'])
    )
    db.update(""" 
        update office set active = 0 where id=%s
        """,(x['office_id'],)
    )
    db.update("""
        update users set active=0 where id in 
            (select user_id from office_user where 
             office_id = %s
        """,(x['office_id'],)
    )
    db.commit()


print("Processed %s records" % CNT)
