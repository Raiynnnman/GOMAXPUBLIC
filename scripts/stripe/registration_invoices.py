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
BS = getIDs.getBillingSystem()
PQS = getIDs.getProviderQueueStatus()
db = Query()

l = db.query("""
    select 
        op.id,op.start_date,op.end_date,op.office_id,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id',opi.id,'price',opi.price,
                'description',opi.description,'quantity',opi.quantity
            )
        ) as items,pq.initial_payment,pd.duration,
        pd.upfront_cost,pd.price,o.commission_user_id,
        cs.id as commission_structure_id,
        cs.commission
    from 
        office_plans op,
        office o,
        office_plan_items opi,
        pricing_data pd,
        commission_structure cs,
        provider_queue pq
    where 
        op.office_id=o.id and
        cs.pricing_data_id = op.pricing_data_id and
        opi.office_plans_id = op.id and
        op.pricing_data_id = pd.id and
        pq.office_id = op.office_id and 
        op.office_id not in (select office_id from invoices) and
        (pq.provider_queue_status_id = %s or pq.provider_queue_status_id = %s)
    group by
        op.id
    """,(PQS['APPROVED'],PQS['QUEUED'])
)
CNT = 0
for x in l:
    CNT += 1
    print(x)
    x['items'] = json.loads(x['items'])
    # All new customers go to new system
    db.update("""
        insert into invoices (office_id,invoice_status_id,
            office_plans_id,billing_period,stripe_tax_id,billing_system_id) 
            values (%s,%s,%s,date(now()),'txcd_10000000',%s)
        """,(x['office_id'],INV['CREATED'],x['id'],BS)
    )
    insid = db.query("select LAST_INSERT_ID()")
    insid = insid[0]['LAST_INSERT_ID()']
    sum = 0
    for y in x['items']:
        # All plans are paid upfront, and since this is first invoice
        sum += x['upfront_cost'] * y['quantity'] * x['duration']
        db.update("""
            insert into invoice_items 
                (invoices_id,description,price,quantity)
            values 
                (%s,%s,%s,%s)
            """,
            (insid,y['description'],sum,y['quantity'])
        )
    if x['commission_user_id'] is not None:
        db.update("""
            insert into commission_users (user_id,commission_structure_id,amount,office_id)
                values (%s,%s,%s,%s)
            """,(x['commission_user_id'],insid,sum*x['commission'],x['office_id'])
        )
    db.update(""" 
        update invoices set total = %s where id = %s
        """,(sum,insid)
    )
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(insid,1,'Generated invoice' )
    )
    db.update("""
        insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
        """,(x['office_id'],insid,'draft')
    )
    months = 0
    if x['price'] != 0:
        months = int(x['upfront_cost'] / x['price'])
    for t in range(0,months):
        j = db.query("""
            select
                date_add(%s, INTERVAL %s month) as bp
            """,(x['start_date'],t)
        )
        bp = j[0]['bp']
        print("Creating billing period %s ($0 invoice) for %s" % (bp,x['office_id']))
        o = db.update("""
            insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period,billing_system_id) 
                values (%s,%s,%s,date_add(%s,interval %s month),%s)
            """,(x['office_id'],INV['CREATED'],x['id'],bp,t,BS)
        )
        newid = db.query("select LAST_INSERT_ID()")
        newid = newid[0]['LAST_INSERT_ID()']
        for y in x['items']:
            db.update("""
                insert into invoice_items 
                    (invoices_id,description,price,quantity)
                values 
                    (%s,%s,%s,%s)
                """,
                (newid,y['description'],0,y['quantity'])
            )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(newid,1,'Generated invoice' )
        )
        db.update("""
            insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
            """,(x['office_id'],newid,'draft')
        )
    db.commit()


print("Processed %s records" % CNT)
