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
key = "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"
stripe.api_key = key

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
args = parser.parse_args()
db = Query()

q = """
    select 
        i.office_id,invoices_id,i.stripe_invoice_id,
        i.nextcheck
    from 
        stripe_invoice_status sis,
        invoices i
    where 
        i.id = sis.invoices_id and
        i.billing_system_id = 1 and
        date_add(sis.created,interval 160 day) > now() 
    """

if not args.force:
    q+= "and (i.nextcheck is null or i.nextcheck < now())"

l = db.query(q)

for x in l:
    if x['stripe_invoice_id'] is None:
        continue
    r = stripe.Invoice.retrieve(x['stripe_invoice_id'])
    payment_intent = r['payment_intent']
    s_fee = 0
    if r['status'] == 'paid' and payment_intent is not None:
        p = stripe.PaymentIntent.retrieve(payment_intent,expand=['latest_charge.balance_transaction'])
        s_fee = p['latest_charge']['balance_transaction']['fee']/100
    db.update("""
        update stripe_invoice_status
            set invoice_pdf_url=%s, invoice_pay_url=%s,
                amount_due=%s, amount_paid=%s,
                attempt_count=%s, next_payment_attempt=%s,
                status=%s, finalized_at=%s, paid_at=%s, voided_at=%s,
                marked_uncollectable_at=%s, stripe_invoice_number=%s,
                due=%s, stripe_fee=%s, stripe_invoice_id=%s
        where 
            invoices_id=%s
        """,(
             r['invoice_pdf'],
             r['hosted_invoice_url'],
             r['amount_due'],
             r['amount_paid'],
             r['attempt_count'],
             r['next_payment_attempt'],
             r['status'],
             r['status_transitions']['finalized_at'],
             r['status_transitions']['paid_at'],
             r['status_transitions']['voided_at'],
             r['status_transitions']['marked_uncollectible_at'],
             r['number'],
             r['due_date'],
             s_fee,
             r['id'],
             x['invoices_id']
        )
    )
    hours = 48
    print("invoice %s in %s" % (x['invoices_id'],r['status']))
    if r['status'] == "open":
        hours = 4
    if r['status'] == "draft":
        hours = .5
    db.update("""
        update invoices set nextcheck = date_add(now(),interval %s hour) 
        where id = %s
        """,(hours,x['invoices_id'])
    )
    #db.update("""
    #    insert into invoice_history (invoices_id,user_id,text) values 
    #        (%s,%s,%s)
    #    """,(x['invoices_id'],1,'Updated stripe status of invoice' )
    #)
    print("updated status for %s" % x['invoices_id'])
    db.commit()
    
