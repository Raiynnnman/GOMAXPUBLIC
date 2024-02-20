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
            ot.id,o.stripe_connect_id,ot.amount,op.stripe_payout_id,
            ot.invoices_id
        from
            office_transfers ot
            left join office o on ot.office_id=o.id
            left outer join office_payouts op on op.office_transfers_id=ot.id
        where
            ot.created > date_add(now(),interval -1 DAY)
            
    """,()
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
            insert into office_payouts (office_transfers_id,stripe_payout_id) values
                (%s,%s)
            """,(x['id'],p['id'])
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(x['invoices_id'],1,'Payout funds to office' )
        )



            
