#!/usr/bin/python

import os
import sys
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from datetime import datetime,timedelta
from common import settings
from util import encryption,calcdate
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")

key = config.getKey("stripe_key")
stripe.api_key = key

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
args = parser.parse_args()
db = Query()
l = db.query("""
        select
            u.id,first_name,last_name,stripe_connect_id,
            addr1,addr2,c.phone,city,state,zipcode, ein_number,
            c.id as consultant_id
        from
            consultant c,users u
        where 
            c.user_id=u.id and
            stripe_connect_id is null
    """)

def createAccount(acc,btype):
    s_account = stripe.Account.create(
        type="custom",
        country="US",
        email="acc-%s-%s@directhealthdelivery.io" % (acc['id'],btype),
        business_type=btype,
        capabilities={
            'card_payments': {"requested":True},
            'transfers': {"requested":True},
            'us_bank_account_ach_payments':{"requested":True}
        },
        individual = { 
            'id_number': acc['ein_number'],
            'first_name': acc['first_name'],
            'last_name': acc['last_name'],
            'address': { 
                'city':acc['city'],
                'country':'US',
                'line1': acc['addr1'],
                'line2': acc['addr2'],
                'postal_code': acc['zipcode'],
                'state': acc['state']
            }
        },
        metadata = { 
            'id': acc['id']
        } 
    )
    env = config.getKey("environment")
    if env == 'production':
        g = datetime.utcnow() - timedelta(days=1)
        stripe.Account.modify(
          acc['stripe_connect_id'],
          tos_acceptance={
            "date": g.strftime("%s"), 
            "ip": "8.8.8.8"
            }
        )
    db.update("update consultant set accepted_tos=1 where id=%s",(acc['consultant_id'],))
    db.update(""" 
        update consultant set stripe_connect_id=%s where id=%s
        """,(s_account['id'],acc['consultant_id'])
    )
    db.commit()

for x in l:
    if x['stripe_connect_id'] is None:
        try:
            createAccount(x,"individual")
        except Exception as e:
            print("ERROR: %s wasnt created: %s" % (x['id'],str(e)))
    # Check balance here
