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
args = parser.parse_args()
db = Query()

q = """
    select 
        o.id as off_id,oc.metadata,
        o.stripe_cust_id
    from 
        office o,
        office_cards oc
    where 
        o.id = oc.office_id and
        oc.sync_provider = 0 and
        oc.metadata is not null and
        o.active = 1 and
        o.stripe_cust_id is not null and
        o.billing_system_id = 2 and
        payment_id is null and
        o.office_type_id = %s
    """

if not args.force and args.id is None:
    q += " and (o.stripe_next_check is null or o.stripe_next_check < now()) "

if args.id is not None:
    q += " and o.id = %s " % args.id

l = db.query(q,(OT['Chiropractor'],))

for x in l:
    print(x)
    meta = x['metadata']
    js = encryption.decrypt(
        meta,
        config.getKey("encryption_key")
    )
    js = json.loads(js)

