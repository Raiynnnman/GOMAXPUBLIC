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
parser.add_argument('--id', dest="id", action="store")
parser.add_argument('--square_id', dest="square_id", action="store")
args = parser.parse_args()
db = Query()

q = """
    select 
        o.id as office_id,o.stripe_cust_id,oc.card_id,oc.brand,
        oc.last4,oc.exp_month,oc.exp_year,
        oc.id as office_cards_id
    from 
        office o, office_cards oc, provider_queue pq
    where 
        pq.office_id = o.id and 
        oc.office_id = o.id and
        oc.sync_retries < 5 and
        (o.active = 1 or sf_lead_executed = 1) and
        o.office_type_id = %s and
        oc.sync_provider = 0 and
        o.billing_system_id = 2 and
        o.stripe_cust_id is not null
    """

if args.id is not None:
    q += " and o.id = %s " % args.id

if args.square_id is not None:
    q += " and o.stripe_cust_id = '%s' " % args.square_id

# print(q)

l = db.query(q,(OT['Chiropractor'],))

BS=getIDs.getBillingSystem()

CNT = 0
for x in l:
    print(x)
    CNT += 1
    try:
        r = {}
        r = client.cards.create_card(body = {
                'source_id':x['card_id'],
                'idempotency_key': encryption.getSHA256()[:45],
                'card': { 
                    'customer_id': x['stripe_cust_id'],
                    'card_brand': x['brand'],
                    'last_4':x['last4'],
                    'exp_month':x['exp_month'],
                    'exp_year':x['exp_year']
                } 
            }
        )
        if r.is_error():
            print(r.errors)
            raise Exception("ERROR retrieving cards")
        r = r.body
        print(json.dumps(r,indent=4))
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,1,'Added card to Square'
            )
        """,(x['office_id'],))
        db.update("""
            update office_cards set sync_provider=1 where id=%s
            """,(x['office_cards_id'],)
        )
        db.commit()
    except Exception as e:
        if str(e) != 'NO_CARD_DATA':
            print("ERROR: %s has an issue: %s" % (x['office_id'],str(e)))
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
    db.update("""
        update office_cards set sync_retries=sync_retries + 1 where id=%s
        """,(x['office_cards_id'],)
    )
    db.commit()

print("Processed %s records" % CNT)
