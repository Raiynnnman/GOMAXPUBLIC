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
        o.name,o.id,o.email,stripe_cust_id,
        o.name as office_name,
        u.title,u.first_name,u.last_name
    from 
        office o,
        users u,
        provider_queue pq
    where 
        pq.office_id = o.id and
        o.user_id = u.id and 
        (o.active = 1 or sf_lead_executed = 1) and
        o.office_type_id = %s and
        o.billing_system_id = 2 and
        o.stripe_cust_id is not null
    """

if not args.force and args.id is None:
    q += " and (o.stripe_next_check is null or o.stripe_next_check < now()) "

if args.id is not None:
    q += " and o.id = %s " % args.id

l = db.query(q,(OT['Chiropractor'],))

BS=getIDs.getBillingSystem()

CNT = 0
for x in l:
    email = x['email']
    if config.getKey('email_to_override') is not None:
        x['email'] = email = config.getKey('email_to_override')
    CNT += 1
    newdata = {}
    try:
        r = {}
        r = client.customers.retrieve_customer(customer_id=x['stripe_cust_id'])
        r = r.body
        # print(json.dumps(r,indent=4))
        if 'customer' in r:
            r = r['customer']
            if config.getKey('email_to_override') is not None:
                r['email'] = config.getKey('email_to_override')
            first = x['first_name']
            last = x['last_name']
            if first == 'Unknown':
                first = ''
            if last == 'Unknown':
                last = ''
            if x['title'] is not None:
                first = "%s %s" % (x['title'],first)
            if r['given_name'] != first:
                newdata['given_name'] = first
            if 'family_name' not in r or r['family_name'] != x['last_name']:
                newdata['family_name'] = last
            if 'email' not in r or r['email'] != x['email']:
                newdata['email_address'] = x['email']
            if 'company' not in r or r['company'] != x['office_name']:
                newdata['company_name'] = x['office_name']
            if len(newdata) > 0:
                r = client.customers.update_customer(x['stripe_cust_id'],body=newdata)
                if r.is_error():
                    print(r.errors)
                    raise Exception("ERROR updating user")
                db.update("""
                    insert into office_history(office_id,user_id,text) values (
                        %s,1,'Updated square information for customer'
                    )
                """,(x['id'],))
        db.commit()
    except Exception as e:
        print("ERROR: %s has an issue: %s" % (x['email'],str(e)))
        print(newdata)
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
    db.commit()

print("Processed %s records" % CNT)
