#!/usr/bin/python

import os
import sys
from datetime import datetime, timedelta,date
import calendar
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
parser.add_argument('--limit', dest="limit", action="store")
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
        day(op.start_date) as dom,pd.customers_required,
        now() > op.end_date as expired,o.migrated_stripe
        
    from 
        office_plans op,
        office_plan_items opi,
        pricing_data pd,
        office o
    where
        op.pricing_data_id = pd.id and
        o.id = op.office_id and
        o.active = 1 and
        o.stripe_cust_id is not null and
        date(op.end_date) > now() and
        opi.office_plans_id = op.id and
        o.billing_system_id = %s and
        o.office_type_id = %s 
    """

if args.office is not None:
    q += " and o.id = %s " % args.office


# print(q % OT['Chiropractor'])

q += " group by op.id order by o.id "
l = db.query(q,(BS,OT['Chiropractor'],))

CNTR = 0
for x in l:
    # print(json.dumps(x,indent=4))
    newdate = ''
    try:
        newdate = date(
            int(datetime.utcnow().strftime("%Y")),
            int(datetime.utcnow().strftime("%m")),
            x['dom']
        )
    except:
        r = calendar.monthrange(
            int(datetime.utcnow().strftime("%Y")),
            int(datetime.utcnow().strftime("%m"))
        )
        newdate = date(
            int(datetime.utcnow().strftime("%Y")),
            int(datetime.utcnow().strftime("%m")),
            r[1]
        )
    # print(newdate)
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
        (%s,%s,%s,'txcd_10000000',%s)
        """,(x['office_id'],INV['CREATED'],newdate,x['billing_system_id'])
    )
    cnt = db.query("""
        select count(id) cnt from client_intake_offices
            where office_id = %s
        """,(x['office_id'],)
    )
    x['cust_total'] = cnt[0]['cnt']
    insid = db.query("select LAST_INSERT_ID()")
    insid = insid[0]['LAST_INSERT_ID()']
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(insid,1,'Invoice created' )
    )
    price = 0
    for g in x['items']:
        # print(g)
        subtotal = round(g['price']*g['quantity'],2)
        price = round(g['price']*g['quantity'],2)
        if x['migrated_stripe'] and x['customers_required'] == 1 and x['cust_total'] == 0:
            price = 0
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(insid,1,'Price set to 0 as customers_required is true (Migrated from Stripe)' )
            )
        elif x['expired'] and x['customers_required'] == 1 and x['cust_total'] == 0:
            price = 0
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(insid,1,'Price set to 0 as customers_required is true (New Customer)' )
            )
        print("price=%s" % price)
        print(x)
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
    db.commit()
    CNTR += 1
    if args.limit is not None and CNTR > int(args.limit):
        break
    
