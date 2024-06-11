#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
import bs4
import requests

sys.path.append(os.getcwd())  # noqa: E402

from salesmate import sm_util
from salesmate.sm_util import SM_Contacts,SM_Companies,SM_Deals
from util.DBOps import Query
import pandas as pd
from common import settings
from util import encryption,calcdate
from util import getIDs

from nameparser import HumanName
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--no_commit', dest="no_commit", action="store_true")
parser.add_argument('--check_pq', dest="check_pq", action="store_true")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

db = Query()

q = """
    select 
        id,sm_id,active,name,email 
    from 
        office o
    where 
        active = 1 and
        o.office_type_id = 1
    """

off = db.query(q)

CONTACT_OBJ = SM_Contacts()
COMPANY_OBJ = SM_Companies()
COMPANY_OBJ.setDebug(True)
DEALS_OBJ = SM_Deals()
ST = getIDs.getLeadStrength()
BS = getIDs.getBillingSystem()
OT = getIDs.getOfficeTypes()
PQ = getIDs.getProviderQueueStatus()
db = Query()

HAVES = {}
OFF = {}
CNTR = 0
DUPS = 0
COMPANIES = sm_util.getCompanies(debug=args.debug)
CONTACTS = sm_util.getContacts(debug=args.debug)
DEALS = sm_util.getDeals(debug=args.debug)
COMPANY_HASH = {}

for x in COMPANIES:
    j = COMPANIES[x]
    myid = j['textCustomField1']
    if myid is None or len(myid) < 1:
        continue
    myid = str(myid)
    COMPANY_HASH[myid] = j

print("COMPHASHLEN=%s" % len(COMPANY_HASH))

CNTR = 0
for x in off:
    j = x
    print(json.dumps(j,indent=4))
    users = db.query("""
        select
            id,first_name,last_name,email,phone
        from 
            users u,
            office_user ou
        where
            ou.user_id=u.id and
            ou.office_id = %s
        """,(j['id'],)
    )
    if len(users) > 0:
        users = users[0]
    else:
        users = {
            'id': 0,
            'email': '',
            'first_name':'',
            'last_name':'',
            'phone':''
        } 
    addr = db.query("""
        select
            addr1,addr2,city,state,zipcode,phone
        from 
            office o,
            office_addresses oa
        where
            oa.office_id=o.id and
            oa.office_id = %s
        """,(j['id'],)
    )
    if len(addr) > 0:
        addr = addr[0]
    else:
        addr = { 
           'phone': '' 
        } 
    myid = j['id']
    if str(myid) in COMPANY_HASH:
        print(json.dumps(COMPANY_HASH[str(myid)]))
        cid = COMPANY_HASH[str(myid)]['id']
        h = COMPANY_HASH[str(myid)]
        if args.check_pq:
            off = db.query("""
                select office_id from provider_queue where id=%s
                """,(cid,)
            )
            if len(off) < 1:
                print("ERROR: didnt find office for pq=%s" % cid)
                continue
            myid=off[0]['office_id']
            print("newid=%s" % myid)
        print("Found %s,%s,%s" % (myid,j['id'],cid))
        u = '%s/#/app/main/admin/office/%s' % (config.getKey("host_url"),myid)
        if h['name'] == x['name'] and h['textCustomField2'] == u and \
           h['checkboxCustomField1'] == x['active'] and h['textCustomField1'] == str(myid):
            print("%s: All values match, skipping" % x['name'])
            continue
        db.update("""
            update office set sm_id = null where sm_id = %s
            """,(cid,)
        )
        db.update("""
            update office set sm_id = %s where id = %s
            """,(cid,myid)
        )
        comp = {
            'id': cid,
            'name': x['name'],
            'textCustomField2': u,
            'textCustomField1': myid,
            'checkboxCustomField1': x['active']
        }
        r = COMPANY_OBJ.update(comp,dryrun=args.no_commit,raw=True)
    else:
        if users['first_name'] is None or len(users['first_name']) < 1:
            users['first_name'] = "Unknown"
        if users['last_name'] is None or len(users['last_name']) < 1:
            users['last_name'] = "Unknown"
        print("didnt find %s (%s)" % (myid,x['name']))
        u = '%s/#/app/main/admin/office/%s' % (config.getKey("host_url"),myid)
        comp = {
            'checkboxCustomField1': j['active'],
            'textCustomField2': u,
            'textCustomField1': j['id'],
            'tags': 'Import Platform',
            'name': j['name'],
            'phone': users['phone']
        } 
        r = COMPANY_OBJ.update(comp,dryrun=args.no_commit,raw=True)
        company_sm_id = r['id']
        contact = { 
            'email': users['email'],
            'company': company_sm_id,
            'firstName': users['first_name'],
            'lastName': users['last_name'],
            'tags': 'Import Platform',
            'phone': users['phone']
        } 
        r = CONTACT_OBJ.update(contact,dryrun=args.no_commit,raw=True)
        contact_sm_id = r['id']
        db.update("""
            update office set sm_id = null where sm_id = %s
            """,(company_sm_id,)
        )
        db.update("""
            update office set sm_id=%s where id=%s
            """,(company_sm_id,myid)
        )
        db.update("""
            update users set sm_id=%s where id=%s
            """,(company_sm_id,users['id'])
        )

    db.commit()
    CNTR += 1
    if args.limit is not None and CNTR >= int(args.limit):
        break
    print("cntr=%s" % CNTR)

db.commit()

