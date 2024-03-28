#!/usr/bin/python

import os
import sys
import traceback
import uuid
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate,getIDs
import argparse
from square.client import Client

config = settings.config()
config.read("settings.cfg")

key = config.getKey("square_api_key")
client = None
if  config.getKey("environment") == 'prod':
    client = Client(access_token=key,environment='production')
else:
    client = Client(access_token=key,environment='sandbox')

OT = getIDs.getOfficeTypes()
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
parser.add_argument('--addclient', dest="addclient", action="store_true")
parser.add_argument('--auto_approve', dest="auto_approve", action="store_true")
parser.add_argument('--office', dest="id", action="store")
parser.add_argument('--plan', dest="plan_id", action="store")
args = parser.parse_args()
db = Query()

if args.id is None:
    print("Office ID required for conversion")
    sys.exit(1)

if args.plan_id is None:
    print("Plan ID required for conversion")
    sys.exit(1)

plan = {}
l = db.query("""
    select 
        id,description,price,
        duration,upfront_cost,
        trial,customers_required
    from 
        pricing_data where description = %s
    """,(args.plan_id,)
    )

if len(l) < 1:
    print("Could not find plan with that description!")
    sys.exit(1)

BS = getIDs.getBillingSystem()
INV = getIDs.getInvoiceIDs()

plan = l[0]
print(plan)

opid = 0
pl = db.query("""
    select id from office_plans where office_id = %s
    """,(args.id,)
    )


# Change current plan to new plan
if len(pl) > 0:
    print("updating plan")
    pl = pl[0]
    db.update("""
        update office_plans set
            pricing_data_id = %s
        where office_id = %s
        """,(plan['id'],args.id)
    )
    db.update("""
        delete from office_plan_items where 
            office_plans_id = %s
        """,(pl['id'],)
    )
else:
    print("creating plan")
    db.update("""
        insert into office_plans
            (office_id,start_date,end_date,pricing_data_id)
        values
            (%s,now(),date_add(now(), INTERVAL %s months,%s)
        """,(args.id,plan['duration'],plan['id'])
    )
    newpid = db.query("select LAST_INSERT_ID()")
    newpid = insid[0]['LAST_INSERT_ID()']
    pl = { 'id': newpid }

db.update("""
    insert into office_plan_items 
        (office_plans_id,price,description,quantity)
    values
        (%s,%s,%s,%s)
    """,(pl['id'],plan['price'],plan['description'],1)
)

# Change billing_system_id to square
# stripe_cust_id to null so it generates new id from square
db.update("""
    update office set stripe_next_check=null,
        stripe_cust_id=null,billing_system_id=%s
    where id = %s
    """,(BS,args.id)
    )

db.update("""
    delete from office_cards where office_id = %s
    """,(args.id,)
    )

invs = db.query("""
    select 
        i.office_id,invoices_id,i.stripe_invoice_id,i.id,
        isi.name as invoice_status
    from 
        stripe_invoice_status sis,
        invoice_status isi,
        invoices i
    where 
        i.id = sis.invoices_id and
        isi.id = i.invoice_status_id and
        month(i.billing_period) = month(now()) and
        year(i.billing_period) = year(now()) and
        i.office_id = %s
    """,(args.id,)
    )

if args.addclient:
    db.update("""
        insert into client_intake (hidden) values (1)
    """)
    cliid = db.query("select LAST_INSERT_ID()")
    cliid = cliid[0]['LAST_INSERT_ID()']
    db.update("""
        insert into client_intake_offices (client_intake_id,office_id) values (%s,%s)
    """,(cliid,args.id)
    )

if len(invs) < 1:
    db.update("""
        insert into invoices (office_id,invoice_status_id,
            office_plans_id,billing_period,billing_system_id,total) 
            values (%s,%s,%s,date(now()),%s,%s)
        """,(x['office_id'],INV['CREATED'],pl['id'],BS,plan['price'])
    )
    invid = db.query("select LAST_INSERT_ID()")
    invid = invid[0]['LAST_INSERT_ID()']
    if args.auto_approve:
        db.update("""
            update invoices set invoice_status_id=%s where id = %s
            """,(INV['APPROVED'],invid)
        )
    price = plan['price']
    if plan['customers_required'] and len(clis) < 1:
        price = 0
    db.update("""
        insert into invoice_items 
            (invoices_id,description,price,quantity)
        values 
            (%s,%s,%s,%s)
        """,
        (invid,plan['description'],price,1)
    )
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(invid,1,'Generated invoice' )
    )
    if len(clis) < 1 and plan['customers_required']:
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(invid,1,'Price set to 0 as customers_required is true' )
        )
    db.update("""
        insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
        """,(x['office_id'],invid,'draft')
    )

for x in invs:
    if x['invoice_status'] == 'PAID':
        print("Invoice already paid for this month")
        continue
    elif x['invoice_status'] == 'ERROR' or x['invoice_status'] == 'SENT' or x['invoice_status'] == 'CREATED':
        print("Regenerating invoice")
        # delete from invoice_history
        db.update("""
            delete from invoice_history where invoices_id = %s
            """,(x['id'],)
        )
        db.update("""
            delete from stripe_invoice_status where invoices_id = %s
            """,(x['id'],)
        )
        # delete from invoice_items
        db.update("""
            delete from invoice_items where invoices_id = %s
            """,(x['id'],)
        )
        # delete from invoice
        db.update("""
            delete from invoices where id = %s
            """,(x['id'],)
        )
        clis = db.query("""
            select count(id) from client_intake_offices where
                office_id = %s
            """,(args.id,)
        )
        # create new invoice and items
        db.update("""
            insert into invoices (office_id,invoice_status_id,
                office_plans_id,billing_period,billing_system_id,total) 
                values (%s,%s,%s,date(now()),%s,%s)
            """,(x['office_id'],INV['CREATED'],pl['id'],BS,plan['price'])
        )
        invid = db.query("select LAST_INSERT_ID()")
        invid = invid[0]['LAST_INSERT_ID()']
        if args.auto_approve:
            db.update("""
                update invoices set invoice_status_id=%s where id = %s
                """,(INV['APPROVED'],invid)
            )
        price = plan['price']
        if plan['customers_required'] and len(clis) < 1:
            price = 0
        db.update("""
            insert into invoice_items 
                (invoices_id,description,price,quantity)
            values 
                (%s,%s,%s,%s)
            """,
            (invid,plan['description'],price,1)
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(invid,1,'Generated invoice' )
        )
        if len(clis) < 1 and plan['customers_required']:
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(invid,1,'Price set to 0 as customers_required is true' )
            )
        db.update("""
            insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
            """,(x['office_id'],invid,'draft')
        )
    else:
        print("ERROR: unexpected status")
        sys.exit(1)

if not args.dryrun:
    db.commit()


