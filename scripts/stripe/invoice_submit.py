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
            i.id,o.stripe_cust_id,i.office_id as office_id,
            u.id as user_id
        from 
            invoices i
            left join office o on i.office_id = o.id 
            left join users u on o.user_id = u.id
            left outer join user_cards uc on uc.user_id=i.user_id
         where 
            o.id = i.office_id and 
            i.billing_period < now() and
            invoice_status_id=%s
    """,(INV['APPROVED'],)
    )
for x in inv:
    if x['id'] is None:
        print("No invoices to process")
        continue
    print("processing invoice %s" % x['id'])
    items = db.query("""
        select description,price,code,quantity from invoice_items where invoices_id=%s
        """,(x['id'],)
    )
    if x['stripe_cust_id'] is None:
        print("Failed to move invoice (%s), customer has no stripe id" % (x['id'],))
        continue
    cust_id = x['stripe_cust_id']
    cards = db.query("""
        select
            uc.id,uc.card_id,uc.is_default,uc.payment_id
        from office_cards uc where office_id=%s
        """,(x['office_id'],)
    )
    card_id = None
    for g in cards:
        if g['id'] is None:
            continue
        if g['is_default'] == 1:
            card_id = g['payment_id']
    mode = "charge_automatically"
    if card_id is None:
        mode = 'send_invoice'
    s = {}
    print("mode=%s,card=%s" % (mode,card_id))
    if mode == 'send_invoice':
        s = stripe.Invoice.create(
            auto_advance=True,
            customer=cust_id,
            collection_method=mode,
            days_until_due=30)
    else:
        s = stripe.Invoice.create(
            auto_advance=True,
            customer=cust_id,
            default_payment_method=card_id,
            collection_method=mode
            )
    for i in items:
        desc = "%s" % (i['description'],)
        stripe.InvoiceItem.create(
            customer=cust_id,
            description=desc,
            amount=int((i['price']*i['quantity'])*100),
            invoice=s.id
        )
    db.update("""
        update invoices set stripe_invoice_id=%s,invoice_status_id=%s where id=%s
        """,(s['id'],INV['GENERATED'],x['id'])
    )
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(x['id'],1,'Submitted invoice to stripe' )
    )
    print("Generated invoice: %s" % x['id'])
    db.commit()

