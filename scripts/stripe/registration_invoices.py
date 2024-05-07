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
        ) as items,ifnull(pq.initial_payment,0) as initial_payment,pd.duration,
        pq.sf_lead_executed, pd.upfront_cost,pd.price,o.commission_user_id,
        cs.id as commission_structure_id,coupons_id,pd.offset_days,pd.customers_required,
        cs.commission,concat(u.first_name,' ',u.last_name) as comm_user
    from 
        office_plans op
        left join office o on op.office_id = o.id
        left join office_plan_items opi on opi.office_plans_id = op.id 
        left join pricing_data pd on op.pricing_data_id=pd.id
        left outer join commission_structure cs on cs.pricing_data_id = pd.id
        left outer join users u on commission_user_id = u.id 
        left join provider_queue pq on pq.office_id = op.office_id 
    where 
        op.office_id not in (select office_id from invoices) and
        and commission_user_id is not null
        and offset_days < 1
    group by
        op.id
    """
)
CNT = 0
for x in l:
    CNT += 1
    print(x)
    x['items'] = json.loads(x['items'])
    if x['initial_payment'] is None:
        x['initial_payment'] = 0
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
        print(y)
        # All plans are paid upfront, and since this is first invoice
        price = 0
        if y['price'] < 1: # Coupon
            sum += y['price']
            price = y['price']
        else:
            price = x['upfront_cost'] * y['quantity'] * x['duration']
            sum += price 
        if x['initial_payment'] > 0:
            price = x['initial_payment']
            sum = x['initial_payment']
        db.update("""
            insert into invoice_items 
                (invoices_id,description,price,quantity)
            values 
                (%s,%s,%s,%s)
            """,
            (insid,y['description'],price,y['quantity'])
        )
    if x['commission'] is None:
        x['commission'] = 0
    if x['sf_lead_executed']:
        db.update("""
            update invoices set invoice_status_id = %s
                where id = %s
            """,(INV['APPROVED'],insid)
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(insid,1,'Auto set to APPROVED as its an SF_LEAD')
        )
    if x['commission_user_id'] is not None:
        db.update("""
            insert into commission_users (user_id,commission_structure_id,amount,office_id,invoices_id)
                values (%s,%s,%s,%s,%s)
            """,(   x['commission_user_id'],
                    x['commission_structure_id'],
                    sum*x['commission'],x['office_id'],insid
                )
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(insid,1,'Calculated commission to %s based on plan' % x['comm_user'] )
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
        # months = int(x['upfront_cost'] / x['price'])
        months = x['duration']
    for t in range(1,months):
        j = db.query("""
            select
                date_add(%s, INTERVAL %s month) as bp
            """,(x['start_date'],t)
        )
        bp = j[0]['bp']
        print("Creating billing period %s ($0 invoice) for %s" % (bp,x['office_id']))
        o = db.update("""
            insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period,billing_system_id) 
                values (%s,%s,%s,%s,%s)
            """,(x['office_id'],INV['CREATED'],x['id'],bp,BS)
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
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(newid,1,'Set invoice to $0 for plan' )
        )
        db.update("""
            insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
            """,(x['office_id'],newid,'draft')
        )
    db.commit()


print("Processed %s records" % CNT)
