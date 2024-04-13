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
        o.name,o.id,o.email,o.stripe_cust_id
    from 
        office o
    where 
        o.active = 1 and
        o.office_type_id = %s and
        o.billing_system_id = 2 and
        o.stripe_cust_id is not null
    """

if not args.force and args.id is None and args.square_id is None:
    q += " and (o.stripe_next_check is null or o.stripe_next_check < now()) "

if args.id is not None:
    q += " and o.id = %s " % args.id

if args.square_id is not None:
    q += " and o.stripe_cust_id = '%s' " % args.square_id

# print(q)

l = db.query(q,(OT['Chiropractor'],))

BS=getIDs.getBillingSystem()

CNT = 0
for x in l:
    CNT += 1
    try:
        r = {}
        r = client.cards.list_cards(customer_id=x['stripe_cust_id'])
        if r.is_error():
            print(r.errors)
            raise Exception("ERROR retrieving cards")
        r = r.body
        # print(json.dumps(r,indent=4))
        if 'cards' not in r:
            raise Exception("NO_CARD_DATA")
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,1,'Added card to Square'
            )
        """,(x['id'],))
        for g in r['cards']:
            if not g['enabled']:
                db.update("""
                    delete from office_cards where id=%s
                    """,(g['id'],)
                )
                continue
            card_id = g['id']
            t = db.query("""
                select id from office_cards where office_id=%s
                    and card_id=%s
                """,(x['id'],card_id)
            )
            if len(t) > 0:
                continue
            db.update("""
                insert into office_cards(
                    office_id,card_id,payment_id,
                    exp_month, exp_year, is_default,
                    brand,sync_provider)
                values (
                    %s,%s,%s,
                    %s,%s,1,
                    %s,1
                )
                """,(x['id'],g['id'],g['id'],
                     g['exp_month'],g['exp_year'],
                     g['card_brand']
                    )
            )
        db.commit()
    except Exception as e:
        if str(e) != 'NO_CARD_DATA':
            print("ERROR: %s has an issue: %s" % (x['email'],str(e)))
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
    db.update("""
        update office set 
            stripe_next_check=date_add(now(),INTERVAL 1 day)
        where id=%s
        """,(x['id'],)
    )
    db.commit()

print("Processed %s records" % CNT)
