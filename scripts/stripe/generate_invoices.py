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
parser.add_argument('--office', dest="office", action="store")
args = parser.parse_args()

APT = getIDs.getAppointStatus()
INV = getIDs.getInvoiceIDs()
BS = getIDs.getBillingSystem()
OT = getIDs.getOfficeTypes()
db = Query()

q = """
    select
        op.office_id,op.id,op.start_date,op.end_date,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id',opi.id,'price',opi.price,'description',
                opi.description,'quantity',opi.quantity
            )
        ) as items,o.stripe_cust_id,o.billing_system_id,
        day(op.start_date) as dom,pd.customers_required
        
    from 
        office_plans op,
        office_plan_items opi,
        pricing_data pd,
        office o
    where
        1 = 1  and
        op.pricing_data_id = pd.id and
        o.id = op.office_id and
        o.active = 1 and
        o.billing_system_id = %s and
        o.stripe_cust_id is not null and
        date(op.end_date) > now() and
        opi.office_plans_id = op.id and
        o.office_type_id = %s 
    """

if args.office is not None:
    q += " and o.id = %s " % args.office


# print(q % OT['Chiropractor'])

q += " group by op.id order by o.id "
l = db.query(q,(BS,OT['Chiropractor'],))


for x in l:
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
    print(json.dumps(x,indent=4))
    insid = 0
    print("Generating invoice for this month for %s" % x['office_id'])
    db.update("""
    insert into invoices(
        office_id,invoice_status_id,billing_period,stripe_tax_id,billing_system_id
        ) 
        values
        (%s,%s,concat(year(now()),'-',month(now()),'-',%s),'txcd_10000000',%s)
        """,(x['office_id'],INV['CREATED'],x['dom'],x['billing_system_id'])
    )
    cnt = db.query("""
        select count(id) cnt from client_intake_offices
            where office_id = %s
        """,(x['office_id'],)
    )
    x['cust_total'] = cnt[0]['cnt']
    insid = db.query("select LAST_INSERT_ID()")
    insid = insid[0]['LAST_INSERT_ID()']
    price = 0
    for g in x['items']:
        # print(g)
        subtotal = round(g['price']*g['quantity'],2)
        price = round(g['price']*g['quantity'],2)
        if x['customers_required'] == 1 and x['cust_total'] == 0:
            price = 0
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
    if price == 0 and x['customers_required']:
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(insid,1,'Price set to 0 as customers_required is true' )
        )
    db.commit()
    
