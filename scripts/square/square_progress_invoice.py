#!/usr/bin/python

import os
import sys
import time
import traceback
import json

sys.path.append(os.getcwd())  # noqa: E402

from util import getIDs
from util.DBOps import Query
from common import settings
from util import encryption,calcdate
import argparse
from square.client import Client

config = settings.config()
config.read("settings.cfg")

key = config.getKey("square_api_key")
loc = config.getKey("square_loc_key")

client = Client(access_token=key,environment='sandbox')
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
args = parser.parse_args()
db = Query()

q = """
    select 
        i.id,i.office_id,i.stripe_invoice_id,
        i.nextcheck, sis.status, i.physician_schedule_id, 
        ist.name as invoice_status,sum(ii.price * ii.quantity) as total
    from 
        stripe_invoice_status sis,
        invoice_status ist,
        invoice_items ii,
        invoices i
    where 
        ii.invoices_id = i.id and
        i.id = sis.invoices_id and
        i.billing_system_id = 2 and
        ist.id = i.invoice_status_id and
        i.stripe_invoice_id is not null and
        date_add(sis.created,interval 160 day) > now() 
    group by
        i.id
    """

if not args.force:
    q += " and (i.nextcheck is null or i.nextcheck < now()) "
l = db.query(q)

key = config.getKey("square_api_key")
loc = config.getKey("square_loc_key")
APT = getIDs.getAppointStatus()
INV = getIDs.getInvoiceIDs()

for x in l:
    try:
        print(x)
        if x['status']  == 'DRAFT' and x['invoice_status'] != 'SENT' and x['total'] == 0:   
            r = client.invoices.cancel(
                invoice_id = x['stripe_invoice_id'],
                body = { 'version': 0 }
            )
            if r.is_error():
                raise Exception(json.dumps(r.errors))
            print("changing status to VOID: %s" % x['id'])
            db.update("""
                update invoices set invoice_status_id=%s where id=%s
                """,(INV['VOID'],x['id'])
            )
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(x['id'],1,'Progressed invoice status to VOID ($0 invoice)')
            )
            db.commit()
        if x['status']  == 'DRAFT' and x['invoice_status'] != 'SENT' and x['total'] > 0:      
            r = client.invoices.publish_invoice(
                invoice_id = x['stripe_invoice_id'],
                body = { 'version': 0 }
            )
            if r.is_error():
                raise Exception(json.dumps(r.errors))
            print("changing status to SENT: %s" % x['id'])
            db.update("""
                update invoices set invoice_status_id=%s where id=%s
                """,(INV['SENT'],x['id'])
            )
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(x['id'],1,'Progressed invoice status to SENT')
            )
            db.commit()
        if x['status']  == 'PAID' and x['invoice_status'] != 'PAID':   
            print("changing status to PAID: %s" % x['id'])
            db.update("""
                update invoices set invoice_status_id=%s where id=%s
                """,(INV['PAID'],x['id'])
            )
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(x['id'],1,'Progressed invoice status to PAID' )
            )
            db.commit()
        db.update("""
            update invoices set nextcheck=date_add(now(),INTERVAL 12 hour)
                where id=%s
            """,(x['id'],)
        )
        db.commit()
    except Exception as e:
        print(str(e))
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)


