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


r = stripe.Balance.retrieve()
bal = r['available'][0]['amount']/100
res = r['connect_reserved'][0]['amount']/100

fees = db.query("""
        select ifnull(round(sum(stripe_fee),2),0) as fee,ifnull(count(stripe_fee),0) as cnt from stripe_invoice_status
            where created > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)
    """)

fees = fees[0]

db.update("delete from stripe_status")
db.commit()
db.update("""
    insert into stripe_status (balance,connect_reserved,fees_this_month,count_inv_this_month)
    values (%s,%s,%s,%s)
    """,(bal,res,fees['fee'],fees['cnt'])
)
db.commit()



