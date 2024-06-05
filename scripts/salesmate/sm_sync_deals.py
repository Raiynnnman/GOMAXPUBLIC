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
DEAL_HASH = {}

for x in DEALS:
    j = DEALS[x]
    if j['stage'] != 'Closed':
        continue
    print(json.dumps(j,indent=4))
    #print("%s=%s" % (x,j['textCustomField1']))
    painid = j['textCustomField1']
    p = j['primaryContact']['phone']
    print("p=%s" % p)
    print("pcp=%s" % j['primaryCompany']['phone'])
    if len(p) < 1 and j['primaryCompany']['phone'] is not None and len(j['primaryCompany']['phone']) > 0:
        p = j['primaryCompany']['phone']
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p.startswith("+1"):
        p = p.replace("+1","")
    if p.startswith("1") and len(p) == 11:
        p = p[1:]
    phone = p
    #print("%s/%s/%s" % (x,j['textCustomField1'],phone))
    if phone is None or len(phone) < 1:
        # print(json.dumps(j,indent=4))
        print("%s has no associated phone" % x)
    elif painid is None or len(painid) < 1 and len(phone) > 0:
        o = db.query("""
            select office_id
            from 
                office_user ou,
                users u
            where 
                ou.user_id=u.id and
                u.phone = %s
            UNION ALL
            select office_id
            from
                office_addresses oa
            where
                oa.phone = %s
            """,(phone,phone)
        )
        if len(o) > 0:
            myid = o[0]['office_id']
            compid = j['primaryCompany']['id']
            db.update("""
                update office set sm_id=%s where id=%s
            """,(compid,myid)
            )
            db.update("""
                update provider_queue set sm_id=%s where office_id=%s
            """,(x,myid)
            )
            u = '%s/#/app/main/admin/office/%s' % (config.getKey("host_url"),myid)
            comp = { 
                'id': compid,
                'textCustomField2': u,
                'textCustomField1': myid
            } 
            print("Found %s (%s)" % (o[0]['office_id'],phone))
            r = COMPANY_OBJ.update(comp,dryrun=args.no_commit,raw=True)
    else:
        print("Didnt find %s" % x)
    db.commit()
        
