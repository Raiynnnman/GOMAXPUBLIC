#!/usr/bin/python
import os
import sys
from datetime import datetime, timedelta
import time
import traceback
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs

import argparse
from square.client import Client

config = settings.config()
config.read("settings.cfg")

key = config.getKey("square_api_key")
loc = config.getKey("square_loc_key")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
args = parser.parse_args()

client = None
if  config.getKey("environment") == 'prod':
    client = Client(access_token=key,environment='production')
else:
    client = Client(access_token=key,environment='sandbox')

APT = getIDs.getAppointStatus()
INV = getIDs.getInvoiceIDs()
BS=getIDs.getBillingSystem()
db = Query()

inv = db.query("""
        select 
            i.id,o.stripe_cust_id,i.office_id as office_id,
            sum(ii.price * ii.quantity) as total,count(i.id) as minv
        from 
            invoices i
            left join office o on i.office_id = o.id 
            left join invoice_items ii on ii.invoices_id = i.id 
            left outer join office_cards uc on uc.office_id=o.id
         where 
            o.id = i.office_id and 
            i.billing_system_id = 2 and
            o.stripe_cust_id is not null and
            i.billing_period <= now() and 
            invoice_status_id=%s
        group by
            i.id
    """,(INV['APPROVED'],)
    )
print(inv)
for x in inv:
    x['minv'] += 1
    if x['id'] is None:
        print("No invoices to process")
        continue
    print("processing invoice %s" % x['id'])
    if x['total'] == 0:
        db.update("""
            update invoices set invoice_status_id=%s,
                    nextcheck=date_add(now(),INTERVAL 24*30*6 DAY)
                     where id = %s
            """,(INV['PAID'],x['id'])
        )
        db.update("""
            replace into invoice_check (invoices_id,nextcheck) values
                (%s,date_add(now(), INTERVAL 24*30*6 DAY))
            """,(x['id'],)
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(x['id'],1,'Marked as PAID ($0 invoice)' )
        )
        print("marking %s as PAID ($0 invoice)" % x['id'])
    else:
        items = db.query("""
            select 
                description,price,
                quantity from invoice_items where invoices_id=%s
            """,(x['id'],)
        )
        cards = db.query("""
            select
                uc.id,uc.card_id,uc.is_default,uc.payment_id
            from office_cards uc where office_id=%s
            """,(x['office_id'],)
        )
        card_id = None
        order = {
            'location_id': loc,
            'reference_id': 'order-%s-%s' % (x['id'],x['office_id']),
            'customer_id': x['stripe_cust_id'],
            'line_items':[]
        }
        for g in items:
            order['line_items'].append({
                'name':g['description'],
                'quantity': str(g['quantity']),
                'base_price_money':{'amount':g['price'] * 100,'currency':'USD'}
            })

        # print(json.dumps(order,indent=4))
        # print("++++")
        try:
            r = client.orders.create_order(body={'order': order});
            if r.is_error():
                raise Exception(json.dumps(s.errors))
            r = r.body
            # print(json.dumps(r,indent=4))
            order_id = r['order']['id']
            db.update("""
                update invoices set order_id = %s where id = %s
                """,(r['order']['id'],x['id'])
            )
            
            for g in cards:
                if g['id'] is None:
                    continue
                if g['is_default'] == 1:
                    card_id = g['payment_id']
            mode = "charge_automatically"
            if card_id is None:
                mode = 'send_invoice'
            s = {}
            print("mode=%s,card=%s" % (mode,card_id))
            print(x)
            
            if mode == 'send_invoice':
                s = client.invoices.create_invoice(
                    body = {
                        'invoice': {
                            'location_id': loc,
                            'order_id': order_id,
                            'primary_recipient': { 
                                'customer_id': x['stripe_cust_id']
                            },
                            'delivery_method':'EMAIL',
                            'invoice_number': str(x['minv']).zfill(7),
                            'store_payment_method_enabled': True,
                            'accepted_payment_methods': { 
                                'card':True,
                                'bank_account':True
                            },
                            'payment_requests': [{
                                'request_type':'BALANCE',
                                'due_date': calcdate.getTimeIntervalAddMonths(None,1).strftime('%Y-%m-%d'),
                                'tipping_enabled':False,
                            }]
                        }
                    }
                )
                if s.is_error():
                    raise Exception(json.dumps(s.errors))
                s = s.body
            elif mode == 'charge_automatically':
                s = client.invoices.create_invoice(
                    body = {
                        'invoice': {
                            'location_id': loc,
                            'order_id': order_id,
                            'primary_recipient': { 
                                'customer_id': x['stripe_cust_id']
                            },
                            'invoice_number': str(x['minv']).zfill(7),
                            'delivery_method':'EMAIL',
                            'store_payment_method_enabled': True,
                            'accepted_payment_methods': { 
                                'card':True,
                                'bank_account':True
                            },
                            'payment_requests': [{
                                'request_type':'BALANCE',
                                'automatic_payment_source':'CARD_ON_FILE',
                                'card_id': card_id,
                                'due_date': calcdate.getTimeIntervalAddMonths(None,1).strftime('%Y-%m-%d'),
                                'tipping_enabled':False,
                            }]
                        }
                    }
                )
                if s.is_error():
                    for g in s.errors:
                        if g['code'] == 'INVALID_CARD':
                            db.update("delete from office_cards where office_id=%s",(x['office_id'],))
                            db.commit()
                            continue
                    raise Exception(json.dumps(s.errors))
                s = s.body
            # print(json.dumps(s.body,indent=4))
            db.update("""
                update invoices set stripe_invoice_id=%s,invoice_status_id=%s where id=%s
                """,(s['invoice']['id'],INV['GENERATED'],x['id'])
            )
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(x['id'],1,'Submitted invoice to Square' )
            )
            print("Generated invoice: %s" % x['id'])
            db.commit()
        except Exception as e:
            print(str(e))
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)

