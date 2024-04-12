#!/usr/bin/python

import os
import random
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

config = settings.config()
config.read("settings.cfg")

user = config.getKey("sf_user")
passw = config.getKey("sf_pass")
token = config.getKey("sf_token")
inst = config.getKey("sf_instance")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--limit', dest="limit", action="store")
parser.add_argument('--sf_id', dest="sf_id", action="store")
parser.add_argument('--painid', dest="painid", action="store")
args = parser.parse_args()
db = Query()

TYPE='Lead'
sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)


if args.sf_id is not None and args.painid is not None:
    t['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),args.painid)
    t['PainID__c'] = args.painid
    try:
        sf.Lead.update(args.sf_id,t)
        db.update("""
            update provider_queue set sf_id = %s where id = %s
            """,(args.sf_id,x['id'])
        )
        db.commit()
    except Exception as e:
        print("ERROR: %s: %s" % (j['Id'],str(e)))
    print("Successfully updated %s" % args.sf_id)
    sys.exit(0)

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

PSCHEMA = sf_util.getPainSchema(TYPE)
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

SF_IDS = {}
o = db.query("""
    select email,sf_id from users where sf_id is not null
    """)
for x in o:
    SF_IDS[x['sf_id']] = x['email']

ARR.append('Notes__c')
ARR.append('Status')
ARR.append('LastModifiedById')
SFQUERY += ','.join(ARR)
SFQUERY += " from Lead "

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

#---- MAIN

SF_DATA = {}
#print(res)
#print(type(res))
CNTR = 0
PHONES = {}
for x in res['records']:
    # print(json.dumps(x,indent=4))
    SF_ID = x['Id']
    if 'attributes' in x:
        del x['attributes']
    SF_DATA[SF_ID] = x
    p = x['Phone']
    if p is None:
        p = x['Email']
    if p is None:
        continue
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p not in PHONES:
        PHONES[p] = []
    PHONES[p].append({
        'Id':x['Id'],
        'u':'https://poundpain.lightning.force.com/lightning/r/Lead/%s/view' % x['Id']
    })

for x in SF_DATA:
    j = SF_DATA[x]
    # print(j)
    if j['PainID__c'] is not None:
        continue
    if 'Phone' not in j or j['Phone'] is None:
        continue
    p = j['Phone']
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p.startswith("+1"):
        p = p.replace("+1","")
    if p.startswith("1") and len(p) == 11:
        p = p[1:]
    print("p=%s" % p)
    o = db.query("""
        select pq.id,o.name,o.email,pq.sf_id from 
            provider_queue pq,
            office o,
            office_addresses oa
        where
            o.id = pq.office_id and
            oa.office_id = o.id and
            oa.phone = %s
        """,(p,)
    )
    if len(o) > 0:
        t = {}
        # print("%s = %s" % (j['Id'],o[0]['id']))
        if j['Email'] is None:
            j['Email'] = 'nobody@nobody.com'
        if j['Email'] != o[0]['email']:
            h = j['Email'].split('@')
            g = o[0]['email'].split('@')
            if len(h) > 1 and len(g) > 1:
                if h[1] != g[1]:
                    print("%s (%s) : Email mismatch, continuing" % (j['Id'],o[0]['id']))
                    print("%s = %s" % (j['Email'],o[0]['email']))
                    print("%s = %s" % (j['Company'],o[0]['name']))
                    print("-----")
                    continue
        t['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),o[0]['id'])
        t['PainID__c'] = o[0]['id']
        try:
            sf.Lead.update(j['Id'],t)
            if o[0]['sf_id'] is None:
                db.update("""
                    update provider_queue set sf_id = %s where id = %s
                    """,(j['Id'],o[0]['id'])
                )
        except Exception as e:
            print("ERROR: %s: %s" % (j['Id'],str(e)))
            # raise e
    db.commit()



