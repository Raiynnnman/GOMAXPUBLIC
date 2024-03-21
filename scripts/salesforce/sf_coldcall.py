#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from salesforce import sf_util
from util.DBOps import Query
import pandas as pd
from common import settings
from util import encryption,calcdate
from util import getIDs
from simple_salesforce import Salesforce

import argparse
import stripe
config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

user = config.getKey("sf_user")
passw = config.getKey("sf_pass")
token = config.getKey("sf_token")
inst = config.getKey("sf_instance")

if args.file is None:
    print("ERROR: Subs File required")
    sys.exit(1)

if not os.path.exists(args.file):
    print("ERROR: Subs File missing")
    sys.exit(1)

ST = getIDs.getLeadStrength()
BS = getIDs.getBillingSystem()
OT = getIDs.getOfficeTypes()
PQ = getIDs.getProviderQueueStatus()
db = Query()

sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)

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

df = pd.read_excel(args.file)
df = df.fillna(0)
df = df.to_dict(orient='index')


OFF = {}
for x in df:
    j = df[x]
    name = j['Provider Name']
    print(name)
    if isinstance(name,int) or len(name) < 1:
        name = j['Practice Name']
    zipcode = j['Zip']
    if isinstance(zipcode,str) and '-' in zipcode:
        zipcode = zipcode.split('-')[0]
    sha = encryption.getSHA256("%s-%s" % (name,zipcode))
    if j['State'] == 'Florida':
        j['State'] = 'FL'
    if sha not in OFF:
        OFF[sha] = {
            'name': name,
            'email': j['Email'],
            'contact_date':j['Contact Date'],
            'contacted_by':j['Contacted By'],
            'address':{
                'line1': j['Address'],
                'city' :j['City'],
                'state':j['State'],
                'zipcode':zipcode
            },
            'score': j['Score'],
            'phone':j['Contact number'],
            'notes':j['Notes'],
            'website': j['Website'],
        }


HAVE = {}
#print("---")
#print(json.dumps(OFF,indent=4))
SFQUERY = "select Email from Lead"
res = sf.query_all(SFQUERY)
print(json.dumps(res,indent=4))
for x in res['records']:
    i= x['Email']
    HAVE[i] = 1

for c in OFF:
    CUST = OFF[c]
    # print(SFSCHEMA['Company'])
    em = CUST['email']
    if em in HAVE:
        continue
    OBJ = {
        SFSCHEMA['Company']['name']:CUST['name'],
        SFSCHEMA['Last Name']['name']:'Unknown',
        SFSCHEMA['First Name']['name']:'Unknown',
        'Street' : CUST['address']['line1'],
        'City' : CUST['address']['city'],
        'State' : CUST['address']['state'],
        'PostalCode': CUST['address']['zipcode'],
        SFSCHEMA['Phone']['name']: CUST['phone'],
        SFSCHEMA['Website']['name']: CUST['website'],
        SFSCHEMA['Score']['name']: CUST['score'],
        SFSCHEMA['Email']['name']: CUST['email'],
        SFSCHEMA['Notes']['name']: CUST['notes'],
        SFSCHEMA['Contact Date']['name']: str(CUST['contact_date']).split(' ')[0],
        SFSCHEMA['Contacted By']['name']: CUST['contacted_by']
    }
    # print(OBJ)
    try:
        r = sf.Lead.create(OBJ)
    except Exception as e:
        print("%s: %s" % (em,str(e)))
        
