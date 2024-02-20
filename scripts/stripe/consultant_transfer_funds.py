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

inv = db.query("""
    select
        i.id as invoices_id,
        c.id as consultant_id,
        c.stripe_connect_id,
        cfi.consultant_user_id,
        i.physician_schedule_id as appt_id,
        round(sum(price),2) as xfer
    from
        invoices i,consultant_fee_items cfi,
        consultant c
    where
        i.id = cfi.invoices_id and
        c.user_id = cfi.consultant_user_id and 
        invoices_id not in (select invoices_id from consultant_transfers)
    group by 
       cfi.invoices_id
    """)

for x in inv:
    print(x)
    stripe_con = x['stripe_connect_id']
    if stripe_con is None or len(stripe_con) < 1:
        print("invoice %s: unable to transfer as user (%s) isnt associated to an office" % (x['invoices_id'],x['user_id']))
        continue
    stripe_xfer = x['xfer']
    if stripe_xfer < 0:
        print("Funds transfer cant be negative")
        continue
    inv_id = x['invoices_id']
    tran = stripe.Transfer.create(
        destination=stripe_con,
        amount=int(stripe_xfer*100),
        currency="usd"
    )
    db.update("""
        insert into consultant_transfers (
            consultant_user_id,invoices_id,stripe_transfer_id,destination,amount
        ) values (
            %s,%s,%s,%s,%s
        )
        """,(x['consultant_user_id'],x['invoices_id'],tran['id'],stripe_con,stripe_xfer)
    )
    db.update("""
        update physician_schedule_scheduled set appt_status_id=%s where physician_schedule_id=%s
        """,(APT['TRANSFER_COMPLETED'],x['appt_id'])
    )
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(x['invoices_id'],1,'Transferred funds to consultant')
    )
    db.commit()

