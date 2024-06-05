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
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

db = Query()

q = """
    select 
        id,sm_id,active,name,email 
    from 
        office 
    where 
    (active = 1) or (sm_id is not null)
    """

off = db.query(q)

CONTACT_OBJ = SM_Contacts()
COMPANY_OBJ = SM_Companies()
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

CNTR = 0
EXCEPT_LIST = []
for x in COMPANIES:
    j = x
    newj = json.loads(json.dumps(j))
    origj = json.loads(json.dumps(j))
    users = db.query("""
        select
            first_name,last_name,email,phone
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
            'first_name':'',
            'last_name':'',
            'phone':''
        } 
    addr = db.query("""
        select
            addr1,addr2,city,state,zipcode
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
    try:
        if x['sm_id'] is None:
            # create new
            pass
        else:
            pass
        comp = {
            'company': j['email'],
            'checkboxCustomField1': j['active'],
            'name': j['name'],
            'phone': u['phone']
        } 
        #r = COMPANY_OBJ.update(comp,dryrun=args.no_commit,raw=True)
        company_sm_id = r['id']
        contact = { 
            'email': j['email'],
            'company': company_sm_id,
            'firstName': j['first'],
            'lastName': j['last'],
            'tags': 'Darius Warm',
            'phone': j['phone'],
            'website': j['website']
        } 
        #r = CONTACT_OBJ.update(contact,dryrun=args.no_commit,raw=True)
        user_sm_id = r['id']
    except Exception as e:
        print(str(e))

    CNTR += 1
    if args.limit is not None and CNTR >= int(args.limit):
        break
    print("cntr=%s" % CNTR)

