#!/usr/bin/python

import os
import random
import traceback
from nameparser import HumanName
import sys
import traceback
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
from salesmate import sm_util
from salesmate.sm_util import SM_Contacts,SM_Companies,SM_Deals

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

PQ = getIDs.getProviderQueueStatus()
ST = getIDs.getLeadStrength()
OT = getIDs.getOfficeTypes()
CS = getIDs.getCallStatus()
ALT = getIDs.getAltStatus()
BS = getIDs.getBillingSystem()
ENT = getIDs.getEntitlementIDs()

debug = args.debug

db = Query()

H=open("sm_contacts.json","r")
js=H.read()
contacts=json.loads(js)
H.close()

H=open("sm_companies.json","r")
js=H.read()
companies=json.loads(js)
H.close()

H=open("sm_users.json","r")
js=H.read()
users=json.loads(js)
H.close()

CNTR = 0
for x in contacts:
    j = contacts[x]
    print("----")
    print(json.dumps(j,indent=4))
    comp = str(j['company']['id'])
    CONT = {
        'name':'unknown-%s' % encryption.getSHA256()[:10],
        'phone':'',
        'provider_queue_call_status_id':None,
    } 
    COMP = {
        'name':'unknown-%s' % encryption.getSHA256()[:10],
        'phone':'',
        'website':'',
        'notes': [],
        'sm_id': None,
        'addr':[]
    } 
    if comp in companies:
        print("c",companies[comp])
        COMP = {
            'name':companies[comp]['name'],
            'phone':companies[comp]['phone'],
            'sm_id': companies[comp]['id'],
            'website':companies[comp]['website'], 
            'notes': [],
            'addr':[{
                'addr1': companies[comp]['billingAddressLine1'],
                'city': companies[comp]['billingCity'],
                'state': companies[comp]['billingState']
            }]
        } 

    if 'description' in j and j['description'] is not None and len(j['description']) > 0:
        COMP['notes'].append(j['description'])
    if 'lastNote' in j and j['lastNote'] is not None and len(j['lastNote']) > 0:
        COMP['notes'].append(j['lastNote'])

    pain_cont_id = 0
    pain_comp_id = 0
    if comp in companies:
        COMPANY = companies[comp]

    pain_cont_id = j['textCustomField1']
    stat_id = None
    stat = j['type']
    if stat and len(stat) > 0:
        stat_id = ALT[stat]

    owner = str(j['owner'])
    if owner not in users:
        owner = str(1)

    p = COMPANY['id']
    print("sm_id=%s" % p)
    o = db.query("""
        select id from office where sm_id = %s
        """,(p,)
    )
    if len(o) > 0:
        pain_comp_id = o[0]['id']

    prov_status = 1
    COMP['do_not_contact'] = 0
    if stat_id == ALT['DNC']:
        COMP['do_not_contact'] = 1
        COMP['provider_queue_status_id'] = PQ['DO_NOT_CONTACT']
    if stat_id == ALT['Not interested']:
        COMP['do_not_contact'] = 1
        COMP['provider_queue_status_id'] = PQ['DO_NOT_CONTACT']
    if stat_id == ALT['NOT INTERESTED IN PI NOW']:
        COMP['do_not_contact'] = 1
        COMP['provider_queue_status_id'] = PQ['DO_NOT_CONTACT']
        

    OWNER = users[owner]
    print(COMPANY)

    uid = db.query("""
        select id from users where lower(email)=lower(%s)
        """,(OWNER['email'],)
    )

    if len(uid) < 1:
        print("ERROR: user %s not found" % OWNER['email'])
        break

    COMP['commission_user_id'] = uid[0]['id']
    COMP['office_alternate_status_id'] = stat_id
    COMP['provider_queue_status_id'] = prov_status

    if pain_comp_id == 0:
        print("creating new company %s" % j['id'])
        # create office
        db.update(""" insert into office (name, office_type_id, billing_system_id , email, sm_id) 
            values (%s,%s,%s,%s,%s)
            """,(COMP['name'],1,BS,j['email'],COMP['id'])
        )
        pain_comp_id = db.query("select LAST_INSERT_ID()")
        pain_comp_id = pain_comp_id[0]['LAST_INSERT_ID()']
        # Create pq
        db.update(""" insert into provider_queue (office_id) values (%s)""",(pain_comp_id,))
        # add addresses
        for g in COMP['addr']:
            db.update(""" insert into office_addresses (office_id,addr1,city,state,phone) 
                values (%s,%s,%s,phone)
            """,(pain_comp_id,g['addr1'],g['city'],g['state'],g['phone'])
            )
        n = HumanName(params['first'])    
        first = "%s %s" % (n.title,n.first)
        last = "%s %s" % (n.last,n.suffix)
        # insert users
        db.update(""" insert into users (email,first_name,last_name,phone) values (%s,%s,%s,%s)
            """,(j['email'],first,last,j['phone'])
        )
        uid = db.query("select LAST_INSERT_ID()")
        uid = uid[0]['LAST_INSERT_ID()']
        db.update("""
            insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
            """,(uid,ENT['Provider'])
        )
        db.update("""
            insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
            """,(uid,ENT['OfficeAdmin'])
        )
        db.update("""
            insert into office_user (user_id,office_id) values (%s,%s)
            """,(uid,pain_comp_id)
        )

    db.update("""
        update office set  office_alternate_status_id=%s where id=%s
        """,(COMP['office_alternate_status_id'],pain_comp_id)
    )
    db.update("""
        update provider_queue set provider_queue_status_id=%s where office_id=%s
        """,(COMP['provider_queue_status_id'],pain_comp_id)
    )
    db.update("""
        update provider_queue set website=%s where office_id=%s
        """,(COMP['website'],pain_comp_id)
    )
    db.update("""
        update office set commission_user_id=%s where id=%s
        """,(COMP['commission_user_id'],pain_comp_id)
    )
    for cc in COMP['notes']: 
        bb2 = encryption.encrypt(
            cc,
            config.getKey('encryption_key')
            )
        db.update("""insert into office_comment (office_id,user_id,text)
            values (%s,1,%s)
        """,(pain_comp_id,bb2)
        )

    db.commit()
    CNTR += 1
    if args.limit is not None and CNTR > int(args.limit):
        break
