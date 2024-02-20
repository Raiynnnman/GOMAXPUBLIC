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

off = db.query("""
        select 
            ct.id,c.stripe_connect_id,ct.amount,cp.stripe_payout_id,ct.invoices_id
        from
            consultant_transfers ct
            left join consultant c on ct.consultant_user_id=c.user_id
            left outer join consultant_payouts cp on cp.consultant_transfers_id=ct.id
        where
            ct.created > date_add(now(),interval -30 DAY)
            
    """,
)

for x in off:
    if ['stripe_payout_id'] is None:
        stripe_con_phy = x['stripe_connect_id']
        amt = x['amount']
        p = stripe.Payout.create(
          amount=int(amt*100),
          currency="usd",
          stripe_account=stripe_con_phy,
        )
        db.update("""
            insert into consultant_payouts (office_transfers_id,stripe_payout_id) values
                (%s,%s)
            """,(x['id'],p['id'])
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(x['invoices_id'],1,'Payout to consultant' )
        )
        db.commit()



            
