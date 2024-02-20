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
        o.name,
        i.id as invoices_id,
        o.id as office_id,
        o.stripe_connect_id,
        ofi.user_id,
        i.physician_schedule_id as appt_id,
        round(sum(price),2) as xfer
    from
        invoices i,office_fee_items ofi, 
        office o
    where
        i.id = ofi.invoices_id and
        ofi.office_id = o.id and
        invoices_id not in (select invoices_id from office_transfers)
    group by 
       ofi.invoices_id,o.id
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
        insert into office_transfers (
            office_id,user_id,invoices_id,stripe_transfer_id,destination,amount
        ) values (
            %s,%s,%s,%s,%s,%s
        )
        """,(x['office_id'],x['user_id'],x['invoices_id'],tran['id'],stripe_con,stripe_xfer)
    )
    db.update("""
        update physician_schedule_scheduled set appt_status_id=%s where physician_schedule_id=%s
        """,(APT['TRANSFER_COMPLETED'],x['appt_id'])
    )
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(x['invoices_id'],1,'Transferred funds to office')
    )
    db.commit()

