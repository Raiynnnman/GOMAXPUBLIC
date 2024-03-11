#!/usr/bin/python

import os
import sys
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util import getIDs
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
        i.id,i.office_id,invoices_id,i.stripe_invoice_id,
        i.nextcheck, sis.status, i.physician_schedule_id, 
        ist.name as invoice_status
    from 
        stripe_invoice_status sis,
        invoice_status ist,
        invoices i
    where 
        i.id = sis.invoices_id and
        i.billing_system_id = 1 and
        ist.id = i.invoice_status_id and
        i.stripe_invoice_id is not null and
        date_add(sis.created,interval 160 day) > now() 
    """
)

APT = getIDs.getAppointStatus()
INV = getIDs.getInvoiceIDs()

for x in l:
    if x['stripe_invoice_id'] is None:
        print("invoice id %s has no stripe_invoice_id" % x['id'])
        continue
    # its set to auto so I shouldnt have to do it
    #if x['status']  == 'draft':   
    #    stripe.Invoice.finalize_invoice(
    #      x['stripe_invoice_id'],
    #    )
    if x['status']  == 'open' and x['invoice_status'] != 'SENT':   
        print("changing status to SENT: %s" % x['invoices_id'])
        db.update("""
            update invoices set invoice_status_id=%s where id=%s
            """,(INV['SENT'],x['invoices_id'])
        )
        db.update("""
            update physician_schedule_scheduled set appt_status_id=%s where physician_schedule_id=%s
            """,(APT['INVOICE_SENT'],x['physician_schedule_id'])
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(x['invoices_id'],1,'Progressed invoice status to SENT')
        )
        db.commit()
    if x['status']  == 'paid' and x['invoice_status'] != 'PAID':   
        print("changing status to PAID: %s" % x['invoices_id'])
        db.update("""
            update invoices set invoice_status_id=%s where id=%s
            """,(INV['PAID'],x['invoices_id'])
        )
        db.update("""
            update physician_schedule_scheduled set appt_status_id=%s where physician_schedule_id=%s
            """,(APT['PAYMENT_SUCCESS'],x['physician_schedule_id'])
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(x['invoices_id'],1,'Progressed invoice status to PAID' )
        )
        db.commit()


