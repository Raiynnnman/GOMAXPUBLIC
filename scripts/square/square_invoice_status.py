#!/usr/bin/python

import os
import sys
import time
import json
import traceback
from random import random

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
import argparse
from square.client import Client

config = settings.config()
config.read("settings.cfg")

key = config.getKey("square_api_key")
loc = config.getKey("square_loc_key")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
parser.add_argument('--debug', dest="debug", action="store_true")
args = parser.parse_args()
db = Query()
client = None
if  config.getKey("environment") == 'prod':
    client = Client(access_token=key,environment='production')
else:
    client = Client(access_token=key,environment='sandbox')

q = """
    select 
        i.id as invoice_id,i.office_id,sis.invoices_id,i.stripe_invoice_id,
        ic.nextcheck,i.id,isi.name as invoice_status,
        sis.status as stripe_invoice_status,i.version
    from 
        invoices i
        left join invoice_status isi on i.invoice_status_id=isi.id
        left join stripe_invoice_status sis on i.id = sis.invoices_id 
        left outer join invoice_check ic on i.id = ic.invoices_id
    where 
        i.billing_system_id = 2 and
        date_add(sis.created,interval 160 day) > now() 
    """

if not args.force:
    q+= "and (ic.nextcheck is null or ic.nextcheck < now())"

l = db.query(q)
INV = getIDs.getInvoiceStatus()

for x in l:
    if args.debug:
        print(x)
    try:
        if x['stripe_invoice_id'] is None:
            continue

        if x['invoice_status'] == 'VOID' and x['stripe_invoice_status'] != 'CANCELED':
            r = client.invoices.cancel_invoice(invoice_id = x['stripe_invoice_id'],body={'version':x['version']})
            if r.is_error():
                print(r.errors)
                if 'NOT_FOUND' in str(r.errors):
                    db.update("""
                        update invoices set invoice_status_id = %s where id = %s
                            (%s,%s,%s)
                        """,(INV['VOID'],x['invoice_id'])
                    )
                else:
                    raise Exception("ERROR canceling invoice")
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(x['invoice_id'],1,'Set invoice to CANCELED' )
            )

        r = client.invoices.get_invoice(invoice_id = x['stripe_invoice_id'])
        if r.is_error():
            r = None
        else:
            r=r.body
        # print(r)
        # print(json.dumps(r,indent=4))
        s_fee = 0
        #if r['status'] == 'paid':
        #    p = stripe.PaymentIntent.retrieve(payment_intent,expand=['latest_charge.balance_transaction'])
        #    s_fee = p['latest_charge']['balance_transaction']['fee']/100
        if r is not None:
            if args.debug:
                print(json.dumps(r,indent=4))
            db.update("""
                update stripe_invoice_status
                    set status=%s
                where
                    invoices_id = %s
                """,(
                        r['invoice']['status'],
                        x['id']
                    )
            )
            db.update("""
                update invoices set version = %s
                where id = %s
                """,(r['invoice']['version'],x['id'])
            )
            if 'invoice_number' in r['invoice']:
                db.update("""
                    update stripe_invoice_status
                        set stripe_invoice_number=%s
                    where invoices_id = %s
                    """,(r['invoice']['invoice_number'],x['id'])
                )
            if 'public_url' in r['invoice']:
                db.update("""
                    update stripe_invoice_status
                        set invoice_pay_url=%s
                    where invoices_id = %s
                    """,(r['invoice']['public_url'],x['id'])
                )
            print("invoice %s in %s" % (x['invoices_id'],r['invoice']['status']))
        hours = 48
        if r is not None and r['invoice']['status'] == "OPEN":
            hours = 4
        if r is not None and r['invoice']['status'] == "UNPAID":
            hours = 4
        if r is not None and r['invoice']['status'] == "DRAFT":
            hours = .5
        if r is not None and r['invoice']['status'] == "VOID":
            # if its void, put it out 6 months
            hours = 24*30*6
        db.update("""
            replace into invoice_check (invoices_id,nextcheck) values
                (%s,date_add(date_add(now(),interval %s hour),INTERVAL %s minute))
            """,(x['invoices_id'],hours,random()*100)
        )
        print("updated status %s for %s" % (r['invoice']['status'],x['invoices_id']))
        db.commit()
    except Exception as e:
        print(str(e))
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
   
