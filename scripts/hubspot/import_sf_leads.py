#!/usr/bin/python

import os
import random
import traceback
import sys
from datetime import datetime, timedelta
import time
import json
from nameparser import HumanName

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs
from salesforce import sf_util

import argparse
from simple_salesforce import Salesforce
from hubspot import HubSpot

config = settings.config()
config.read("settings.cfg")

user = config.getKey("sf_user")
passw = config.getKey("sf_pass")
token = config.getKey("sf_token")
inst = config.getKey("sf_instance")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--sf_id', dest="sf_id", action="store")
parser.add_argument('--limit', dest="limit", action="store")
parser.add_argument('--force_sf', dest="force_sf", action="store_true")
parser.add_argument('--excp_pass', dest="excp_pass", action="store_true")
parser.add_argument('--force_pain', dest="force_pain", action="store_true")
parser.add_argument('--del_dups', dest="del_dups", action="store_true")
parser.add_argument('--doall', dest="do_all", action="store_true")
parser.add_argument('--only_fields', dest="only_fields", action="store")
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--no_new', dest="no_new", action="store_true")
args = parser.parse_args()

sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)

api_client = HubSpot(access_token=config.getKey('hubspot_api_key'))

TYPE='Lead'
db = Query()

PQ = getIDs.getProviderQueueStatus()
ST = getIDs.getLeadStrength()
OT = getIDs.getOfficeTypes()

debug = args.debug

PSCHEMA = sf_util.getPainSchema(TYPE)

SCHEMA = {}
schema_f = 'sf_leads_schema.json'
data_f = 'sf_leads_data.json'
res = sf_util.cacheOrLoad(schema_f,sf.Lead.describe)
SFSCHEMA = {}
for x in res['fields']:
    # print(x['name'])
    lab = x['label']
    SFSCHEMA[lab] = x
    # print(json.dumps(x,indent=4))
    # print("----")

SFQUERY = "select  "
HAVE={}
ARR = []
for x in PSCHEMA:
    sc = PSCHEMA[x]
    col = sc['sf_field_name']
    # print(col)
    if col not in SFSCHEMA:
        print("WARNING: %s is missing" % col)
        continue
    if col in HAVE:
        print("WARNING: duplicate column %s" % col)
        continue
    HAVE[col] = 1
    sfcol = SFSCHEMA[col]
    # print(sfcol)
    ARR.append(sfcol['name'])

ARR.append('Addresses_ID__c')
SFQUERY += ','.join(ARR)
SFQUERY += " from Lead "
if args.sf_id is not None:
    SFQUERY += " where Id = '%s'" % args.sf_id
if args.debug:
    print(SFQUERY)

res = []
if os.path.exists(data_f):
    print("Loading %s from disk" % data_f)
    H=open(data_f,"r")
    res = json.loads(H.read())
    H.close()
else:
    res = sf.query_all(SFQUERY)
    H=open(data_f,"w")
    H.write(json.dumps(res,indent=4))
    H.close()

SF_DATA = {}
#print(res)
#print(type(res))
CNTR = 0
for x in res['records']:
    if args.debug:
        print(json.dumps(x,indent=4))
    SF_ID = x['Id']
    SF_DATA[SF_ID] = x
    p = x['Phone']
    if 'attributes' in x:
        del x['attributes']

all_companies = api_client.crm.companies.get_all()
print(all_companies)

all_contacts = api_client.crm.contacts.get_all()
print(all_contacts)

#all_users = api_client.crm.user.get_all()
#print(all_users)

all_deals = api_client.crm.deals.get_all()
print(all_deals)

# print(all_contacts)
HASH={
    'contacts':{},
    'companies':{},
    'users':{},
    'deals':{}
}

for x in all_contacts:
    HASH['contacts']['hs_object_id'] = x

for x in all_companies:
    HASH['companies']['hs_object_id'] = x

for x in all_deals:
    HASH['deals']['hs_object_id'] = x

CONTACT_MAPPING = {
    'Email':'email',
    'FirstName':'firstname',
    'Phone':'phone',
    'LastName':'lastname'
}
DEAL_MAPPING = {
    'OwnerId':'hubspot_owner_id',
    'Payment_Amount__c':'payment_amount',
    "Ready_To_Buy__c": 'ready_to_buy',
    "Subscription_Plan__c": 'subscription_plan',
    "Sales_Link__c": 'sales_link',
}
COMPANY_MAPPING = {
    'PainID__c':None,
    'Addresses_ID__c':None,
    'PainURL__c':None,
    'Company':'name',
    'OwnerId':'hubspot_owner_id',
    'Street': 'address',
    'Website':'website',
    'PostalCode':'zip',
    'Phone':'phone',
    'City':'city',
    'State':'state',
}

PAIN_OFF=db.query("""
    select hubspot_id,id from office where hubspot_id is not null
    """)
PAIN_CONT=db.query("""
    select hubspot_id,id from users where hubspot_id is not null
    """)
    

CNTR = 0
for x in SF_DATA:
    j = SF_DATA[x]
    # print(json.dumps(j,indent=4,sort_keys=True))
    CONTACT = {}
    COMPANY = {}
    DEAL = {}

    for x in j:
        if x in CONTACT_MAPPING:
            v = CONTACT_MAPPING[x] 
            CONTACT[v] = j[x]
        if x in DEAL_MAPPING:
            v = DEAL_MAPPING[x] 
            DEAL[v] = j[x]
        if x in COMPANY_MAPPING:
            v = COMPANY_MAPPING[x] 
            COMPANY[v] = j[x]
    print("CONT=%s" % CONTACT)
    print("DEAL=%s" % DEAL)
    print("COMPANY=%s" % COMPANY)
    
    break
