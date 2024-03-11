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
db = Query()

l = db.query("""
    select 
        op.id,start_date,end_date,op.office_id,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id',opi.id,'price',opi.price,'description',opi.description,'quantity',opi.quantity
            )
        ) as items,pq.initial_payment
    from 
        office_plans op,
        office_plan_items opi,
        provider_queue pq
    where 
        opi.office_plans_id = op.id and
        pq.office_id = op.office_id and 
        op.office_id not in (select office_id from invoices)
    group by
        op.id
    """)
CNT = 0
for x in l:
    CNT += 1
    print(x)
    x['items'] = json.loads(x['items'])
    # All new customers go to new system
    o = db.update("""
        insert into invoices (office_id,invoice_status_id,
            office_plans_id,billing_period,stripe_tax_id,billing_system_id) 
            values (%s,%s,%s,date(now()),'txcd_10000000',%s)
        """,(x['office_id'],INV['CREATED'],x['id'],BS)
    )
    insid = db.query("select LAST_INSERT_ID()")
    insid = insid[0]['LAST_INSERT_ID()']
    sum = 0
    for y in x['items']:
        if x['initial_payment'] > 0:
            sum += x['initial_payment']
            db.update("""
                insert into invoice_items 
                    (invoices_id,description,price,quantity)
                values 
                    (%s,%s,%s,%s)
                """,
                (insid,'Subscription Start Payment',x['initial_payment'],1)
            )
        else:
            sum += y['price'] * y['quantity']
            db.update("""
                insert into invoice_items 
                    (invoices_id,description,price,quantity)
                values 
                    (%s,%s,%s,%s)
                """,
                (insid,y['description'],y['price'],y['quantity'])
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
    db.commit()


print("Processed %s records" % CNT)
