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
OT = getIDs.getOfficeTypes()
db = Query()
q = db.query("""
    select
        op.office_id,op.id,start_date,end_date,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id',opi.id,'price',opi.price,'description',
                opi.description,'quantity',opi.quantity
            )
        ) as items,o.stripe_cust_id,o.billing_system_id
        
    from 
        office_plans op,
        office_plan_items opi,
        office o
    where
        1 = 1  and
        o.id = op.office_id and
        o.active = 1 and
        o.stripe_cust_id is not null and
        date(op.end_date) > now() and
        o.office_type_id = %s and
        opi.office_plans_id = op.id 
    group by
        op.id
    """,(OT['Chiropractor'],)
)

for x in q:
    # print(json.dumps(x,indent=4))
    x['items'] = json.loads(x['items'])
    o = db.query("""
        select 
            id 
        from 
            invoices 
        where 
            year(billing_period) = year(now()) and
            month(billing_period) = month(now()) and
            office_id = %s 
        """,(x['office_id'],)
    )
    HAVE = False
    for t in o:
        HAVE=True
    if HAVE:
        # print("Office %s already has an invoice for this month, skipping"%x['office_id'])
        continue
    insid = 0
    print("Generating invoice for this month for %s" % x['office_id'])
    db.update("""
    insert into invoices(
        office_id,invoice_status_id,billing_period,stripe_tax_id,billing_system_id
        ) 
        values
        (%s,%s,date(now()),'txcd_10000000',%s)
        """,(x['office_id'],INV['CREATED'],x['billing_system_id'])
    )
    insid = db.query("select LAST_INSERT_ID()")
    insid = insid[0]['LAST_INSERT_ID()']
    for g in x['items']:
        # print(g)
        subtotal = g['price']*g['quantity']
        price = round(g['price']*g['quantity'],2)
        db.update("""
            insert into invoice_items (
                    invoices_id,description,price,quantity
                ) values (
                %s,%s,%s,%s
            )
            """,(
                insid,g['description'],price,g['quantity']
            )
        )
    db.update("""
        insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
        """,(x['office_id'],insid,'draft')
    )
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(insid,1,'Generated invoice' )
    )
    db.commit()
    
