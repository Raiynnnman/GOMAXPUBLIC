#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

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
parser.add_argument('--file', dest="file", action="store")
parser.add_argument('--commission', dest="commission", action="store")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

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

df = pd.read_excel(args.file)
df = df.fillna(0)
df = df.to_dict(orient='index')

OFF = {}
for x in df:
    j = df[x]
    name = zipcode = ''
    if isinstance(j['Email'],int) or j['Email'] == str("0"):
        j['Email'] = "unk-%s@poundpain.com" % encryption.getSHA256()[:10]
    if '-' in str(j['Zipcode']):
        j['Zipcode'] = str(j['Zipcode']).split('-')[0]
    if isinstance(j['Company Name'],int) or j['Company Name'] == str("0"):
        if j['Name'] != str(0):
            j['Company Name'] = j['Name']
        else:
            j['Company Name'] = j['Email']
    name = j['Company Name']
    zipcode = j['Zipcode']
    sha = encryption.getSHA256("%s-%s" % (name,zipcode))
    if isinstance(j['Phone'],float):
        j['Phone'] = str(int(j['Phone']))
    if isinstance(j['Phone'],int):
        j['Phone'] = str(int(j['Phone']))
    if len(j['Phone']) == 11 and j['Phone'].startswith("1"):
        j['Phone'] = j['Phone'][1:]
    if sha not in OFF:
        OFF[sha] = {
            'address':{
                'addr1': j['Address'],
                'city' :j['City'],
                'state':j['State'],
                'zipcode':zipcode
            },
            'phone':j['Phone'],
            'website': j['Website'],
            'name':j['Company Name'],
            'providers':[]
        }
    
    j['commission_user_id'] = args.commission
    print("name=%s" % j['Name'])
    if 'Name' in j:
        if not isinstance(j['Name'],str) or j['Name'] == str("0"):
            j['Contact First'] = "Unknown"
            j['Contact Last'] = "Unknown"
        elif 'Name' in j:
            n = HumanName(j['Name'])
            j['Contact First'] = "%s %s" % (n.title,n.first)
            j['Contact Last'] = "%s %s" % (n.last,n.suffix)
        
    OFF[sha]['providers'].append({
        'first_name': j['Contact First'],
        'last_name': j['Contact Last'],
        'email': j['Email']
    })

#print("---")
#print(json.dumps(OFF,indent=4))

CNTR = 0
for c in OFF:
    CUST = OFF[c]
    if 'email' not in CUST:
        CUST['email'] = CUST['providers'][0]['email']
    email = CUST['email']
    email = email.lower()
    user_id = 0
    off_id = 0
    l = db.query("""
        select id as f1,email as f2,0 as f3 from office where email = %s
        UNION ALL
        select o.id as f1,oa.name as f2,oa.zipcode as f3
            from office o, office_addresses oa
        where o.name = %s and oa.zipcode = %s
        UNION ALL
        select id as f1,phone as f2,0 as f3 from office_addresses oa
        where oa.phone = %s 
        """,(email,CUST['name'],CUST['address']['zipcode'],CUST['phone'])
    )
    for x in l:
        print(x)
        off_id = x['f1']
    if off_id != 0:
        print("Office %s (%s) already imported, skipping" % (CUST['name'],CUST['address']['zipcode']))
        continue
    print("ins=%s,%s" % (CUST['name'],args.commission))
    db.update("""
        insert into office 
            (name,office_type_id,email,billing_system_id,active,commission_user_id,import_sf)
            values
            (%s,%s,%s,%s,0,%s,1)
        """,(CUST['name'],OT['Chiropractor'],email,BS,args.commission)
    )
    off_id = db.query("select LAST_INSERT_ID()")
    off_id = off_id[0]['LAST_INSERT_ID()']
    db.update("""
        insert into office_addresses
            (office_id,addr1,phone,city,state,zipcode,name) 
            values 
            (%s,%s,%s,%s,%s,%s,%s)
        """,(
            off_id,
            CUST['address']['addr1'],
            CUST['phone'],
            CUST['address']['city'],
            CUST['address']['state'],
            CUST['address']['zipcode'],
            CUST['name']
            )
    )
    
    l = db.query("""
        select id from provider_queue where office_id=%s
        """,(off_id,)
    )
    PQ_ID = 0
    HAVE_PQ = False
    INITIAL_PAYMENT = 0
    for t in l:
        PQ_ID = t['id']
        HAVE_PQ = True
    if not HAVE_PQ:
        db.update("""
        insert into provider_queue(
                office_id,provider_queue_status_id,provider_queue_lead_strength_id,
                website
            ) 
            values (%s,%s,%s,%s)
        """,(
            off_id,PQ['QUEUED'],ST['Potential Provider'],
            CUST['website']
            )
        )
        PQ_ID = db.query("select LAST_INSERT_ID()")
        PQ_ID = PQ_ID[0]['LAST_INSERT_ID()']
    SET_UID = False
    for t in CUST['providers']:
        user_id = 0
        uu = db.query("""
            select id from users where email = %s
            """,(t['email'].lower(),)
        )
        for z in uu:
            user_id = z['id']
        if user_id == 0:
            db.update("""
                insert into users(email,first_name,last_name,phone,active) 
                    values (lower(%s),%s,%s,%s,0)
            """,(
                t['email'],t['first_name'],t['last_name'],
                CUST['phone']
                )
            )
            user_id = db.query("select LAST_INSERT_ID()")
            user_id = user_id[0]['LAST_INSERT_ID()']
        db.update("""
            insert into office_user(user_id,office_id) 
                values (%s,%s)
        """,(
            user_id,off_id
            )
        )
        if not SET_UID:
            db.update("""
                update office set user_id = %s where id = %s
                """,(user_id,off_id)
            )
            SET_UID=True
        db.update("""
            insert into user_entitlements(user_id,entitlements_id) values 
            (%s,3)
            """,(user_id,)
        )
        db.update("""
            insert into user_permissions(user_id,permissions_id) values 
            (%s,1)
            """,(user_id,)
        )
    if not args.dryrun:
        db.commit()
    print("Saved %s (%s)" % (CUST['name'],CUST['address']['zipcode']))
    CNTR += 1
    if args.limit is not None and CNTR > int(args.limit):
        break
    
        
