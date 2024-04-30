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
from salesmate import sm_util
from common import settings
from util import encryption,calcdate
from util import getIDs
from salesforce import sf_util
from salesmate.sm_util import SM_Contacts,SM_Companies,SM_Deals

import argparse
from simple_salesforce import Salesforce

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
parser.add_argument('--deal', dest="deal", action="store_true")
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
    #if args.debug:
    #    print(json.dumps(x,indent=4))
    SF_ID = x['Id']
    SF_DATA[SF_ID] = x
    p = x['Phone']
    if 'attributes' in x:
        del x['attributes']

contact = SM_Contacts()
contact.setDebug(args.debug)
company = SM_Companies()
company.setDebug(args.debug)
deals = SM_Deals()

# contact.setDebug(True)

CONTACT_MAPPING = {
    'Email':'email',
    'Salutation':'title',
    'FirstName':'firstName',
    'Phone':'phone',
    'PainID__c':'textCustomField1',
    'LastName':'lastName',
    'OwnerId':'ownerid',
}

DEAL_MAPPING = {
    'OwnerId':'ownerid',
    'Payment_Amount__c':'textCustomField4',
    "Ready_To_Buy__c": 'textCustomField5',
    "Subscription_Plan__c": 'textCustomField6',
    "Id": 'textCustomField4',
    'PainID__c':'textCustomField1',
    'PainURL__c':'textCustomField3',
    'Sales_Link__c':'textCustomField2'
}

COMPANY_MAPPING = {
    'PainID__c':'textCustomField1',
    'PainURL__c':'textCustomField2',
    'Addresses_ID__c':'textCustomField4',
    'Company':'name',
    'OwnerId':'owner',
    'Street': 'billingAddressLine1',
    'Website':'website',
    'PostalCode':'zip',
    'Phone':'phone',
    'City':'billingCity',
    'State':'billingState',
    'Id': 'textCustomField5'
}

HAVE = {}
CONTACTS = sm_util.getContacts(debug=args.debug)
DEALS = sm_util.getDeals(debug=args.debug)
COMPANIES = sm_util.getCompanies(debug=args.debug)
USERS = sm_util.getUsers(debug=args.debug)

for g in CONTACTS:
    v = g['email']
    HAVE[v] = 1
    v = g['phone']
    HAVE[v] = 1

SF_USERS = {}
o = db.query("""
        select id,sf_id,sm_id from
            users where sm_id is not null
        """,
)
for x in o:
    SF_USERS[x['sf_id']] = x['sm_id']


CNTR = 0
for x in SF_DATA:
    j = SF_DATA[x]
    # print(json.dumps(j,indent=4,sort_keys=True))
    print("DONE")
    CONTACT = {}
    COMPANY = {}
    DEAL = {}
    e = j['Email']
    if e in HAVE:
        continue
    e = j['Phone']
    if e in HAVE:
        continue

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

    if j['PainID__c'] is None:
        print("Skipping %s, painid is None" % j['Id'])
        continue
    pq_id = int(j['PainID__c'])
    if pq_id in HAVE:
        print("Skipping %s, already have " % j['Id'])
        continue

    HAVE[pq_id] = 1
    off_id = 0
    o = db.query("""
        select office_id from provider_queue where id=%s
        """,(pq_id,)
    )
    for x in o:
        off_id = o[0]['office_id']

    if off_id == 0:
        print("%s: Couldnt find office for %s" % (j['Id'],pq_id))
        continue

    user_id = 0
    o = db.query("""
        select user_id from office where id=%s
        """,(off_id,)
    )
    for x in o:
        user_id = o[0]['user_id']

    if user_id == 0:
        print("%s: Couldnt find userid for %s" % (j['Id'],off_id))
        continue

    owner_id = 4 # Paul
    if j['OwnerId'] in SF_USERS:
        owner_id = SF_USERS[j['OwnerId']]
    COMPANY['owner'] = owner_id
    COMPANY['tags'] = 'Import SF'

    print("COMPANY=%s" % COMPANY)
    company.setCall('/apis/company/v4')
    company.setType('POST')
    company.setIsUpdate(False)
    r = company.getData(payload=json.dumps(COMPANY))
    company_sm_id = r['id']
    db.update("""
        update office set sm_id = %s
            where id=%s""",(company_sm_id,off_id,)
    )
    print("result=%s" % r)
    print("CONT=%s" % CONTACT)
    CONTACT['company'] = company_sm_id
    CONTACT['tags'] = 'Import SF'
    CONTACT['owner'] = owner_id
    contact.setIsUpdate(False)
    contact.setCall('/apis/contact/v4')
    contact.setType('POST')
    r = contact.getData(payload=json.dumps(CONTACT))
    user_sm_id = r['id']
    db.update("""
        update users set sm_id = %s
            where id=%s""",(user_sm_id,user_id,)
    )
    if args.deal:
        DEAL['primaryContact'] = user_sm_id
        DEAL['owner'] = owner_id
        DEAL['tags'] = 'Import SF'
        DEAL['title'] = "Lead for %s" % j['Company']
        sfl = DEAL_MAPPING['Id']
        DEAL[sfl] = j['Id']
        stage = "New (Untouched)"
        if j['Status'] == 'Working':
            stage = 'Contacted'
        if j['Status'] == 'Nurturing':
            stage = 'Qualified'
        DEAL['stage'] = stage
        print("DEAL=%s" % DEAL)
        r = deals.update(DEAL)
        deal_sm_id = r['id']
        db.update("""
            update provider_queue set sm_id = %s
                where id=%s""",(deal_sm_id,pq_id,)
        )
    db.commit()
    CNTR += 1
    if args.limit is not None:
        if CNTR > int(args.limit):
            break

