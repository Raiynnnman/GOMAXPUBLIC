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
l = db.query("""
    select 
        op.id,op.start_date,op.end_date,op.office_id,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id',opi.id,'price',opi.price,'description',opi.description,'quantity',opi.quantity
            )
        ) as items,pq.initial_payment,pd.price,pd.duration
    from 
        office_plans op,
        office o,
        pricing_data pd,
        office_plan_items opi,
        provider_queue pq
    where 
        op.office_id = o.id and
        o.active = 1 and
        op.pricing_data_id = pd.id and
        opi.office_plans_id = op.id and
        pq.office_id = op.office_id and 
        op.end_date > now() and
        op.office_id in (select office_id from invoices) and
        pq.initial_payment > 0
    group by
        op.id
    """)

for x in l:
    print(x)
    x['items'] = json.loads(x['items'])
    total_val = x['price']*x['duration']
    print(total_val)
    months = int(x['initial_payment'] / x['price'])
    print(months)
    for t in range(0,months):
        j = db.query("""
            select
                id
            from 
                invoices
            where
                office_id = %s and
                billing_period = date_add(%s, INTERVAL %s month)
            """,(x['office_id'],x['start_date'],t)
        )
        if len(j) < 1:
            o = db.update("""
                insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period) 
                    values (%s,%s,%s,date_add(%s,interval %s month))
                """,(x['office_id'],INV['CREATED'],x['id'],x['start_date'],t)
            )
            insid = db.query("select LAST_INSERT_ID()")
            insid = insid[0]['LAST_INSERT_ID()']
            for y in x['items']:
                db.update("""
                    insert into invoice_items 
                        (invoices_id,description,price,quantity)
                    values 
                        (%s,%s,%s,%s)
                    """,
                    (insid,y['description'],0,y['quantity'])
                )
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(insid,1,'Generated invoice' )
            )
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(insid,1,'Marked as paid' )
            )
            db.update("""
                insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
                """,(x['office_id'],insid,'draft')
            )
    db.commit()





