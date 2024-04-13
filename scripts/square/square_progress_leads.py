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

client = None
if  config.getKey("environment") == 'prod':
    client = Client(access_token=key,environment='production')
else:
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
        ist.name as invoice_status,sum(ii.price * ii.quantity) as total,
        pq.sf_lead_executed
    from 
        stripe_invoice_status sis,
        office o,
        office_plans op,
        provider_queue pq,
        invoice_status ist,
        invoice_items ii,
        invoices i
    where 
        op.office_id = o.id and 
        o.id = pq.office_id and
        i.office_id = o.id and
        ii.invoices_id = i.id and
        i.id = sis.invoices_id and
        i.billing_system_id = 2 and
        ist.id = i.invoice_status_id and
        pq.sf_lead_executed = 1 and
        year(i.billing_period) = year(op.start_date) and
        month(i.billing_period) = month(op.start_date) and
        i.stripe_invoice_id is null and
        year(i.billing_period) = year(now()) and
        month(i.billing_period) = month(now()) and
        date_add(sis.created,interval 160 day) > now() 
    group by
        i.id
    """

l = db.query(q)

key = config.getKey("square_api_key")
loc = config.getKey("square_loc_key")
APT = getIDs.getAppointStatus()
INV = getIDs.getInvoiceIDs()

for x in l:
    try:
        print(x)
        if x['invoice_status'] == 'CREATED': 
            print("changing status to APPROVED : %s " % x['id'])
            db.update("""
                update invoices set invoice_status_id=%s
                    where id=%s
                """,(INV['APPROVED'],x['id'])
            )
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(x['id'],1,'Progress invoice to APPROVED (sf_lead)')
            )
        db.commit()
    except Exception as e:
        print(str(e))
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)


