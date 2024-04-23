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
df = df.fillna('')
df = df.to_dict(orient='index')

HAVES = {}
OFF = {}
CNTR = 0
DUPS = 0
for x in df:
    j = df[x]
    # print(j)
    name = zipcode = ''
    j['Phone'] = "%s%s" % (j['Area Code'],j['Phone Number'])
    p = j['Phone']
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p.startswith("+1"):
        p = p.replace("+1","")
    if p.startswith("1") and len(p) == 11:
        p = p[1:]
    if p is not None and len(p) > 0:
        if p in HAVES:
            # print("DUP number found, skip")
            DUPS += 1
            continue
    HAVES[p] = 1
    j['Phone'] = p
    if isinstance(j['Email'],int) or j['Email'] == str("0"):
        j['Email'] = "unk-%s@poundpain.com" % encryption.getSHA256()[:10]
    if '-' in str(j['Practice Zip Code']):
        j['Practice Zip Code'] = str(j['Practice Zip Code']).split('-')[0]
    j['Company Name'] = j['Business-Name']
    if j['Business-Name'] is None or len(j['Business-Name']) < 1:
        j['Company Name'] = "%s %s" % (j['First-Name'],j['Last-Name'])
    email = j['Email']
    email = email.lower()
    if email is not None and len(email) > 0:
        if email in HAVES:
            # print("DUP email found, skip")
            DUPS += 1
            continue
    HAVES[email] = 1
    name = j['Company Name']
    zipcode = str(j['Practice Zip Code'])
    if zipcode is not None and '-' in zipcode:
        zipcode = zipcode.split('-')[0]
    if isinstance(j['Phone'],float):
        j['Phone'] = str(int(j['Phone']))
    if isinstance(j['Phone'],int):
        j['Phone'] = str(int(j['Phone']))
    if len(j['Phone']) == 11 and j['Phone'].startswith("1"):
        j['Phone'] = j['Phone'][1:]
    f1 = False
    f2 = False
    # print(j['Practice Address'],j['Practice Address 2'])
    for x in range(0,10):
        if str(x) in str(j['Practice Address']):
            f1 = True
        if str(x) in str(j['Practice Address 2']):
            f2 = True
    if f1 is False and f2 is True:
        # print("No address in f1, but in f2")
        j['Practice Address'] = j['Practice Address 2']
        j['Practice Address 2'] = ''
    addr1 = "%s %s %s %s" % (
        j['Practice Address'],j['Practice Address 2'],
        j['Practice City'],j['Practice State']
    )
    m = "%s%s%s" % (addr1.split(" ")[0],j['Practice City'], j['Practice State'])
    m = m.lower()
    if m in HAVES:
        DUPS += 1
        continue
    HAVES[m] = 1
    addr1 = addr1.lower().replace(".","").replace("#"," suite ").replace(";","")
    addr1_s = addr1
    addr1 = addr1.replace(" dr "," drive ").replace(" st "," street ").replace(" ave "," avenue ")\
            .replace(" hwy ", " highway ").replace(" rd ", " road ").replace(" blvd "," boulevard ")\
            .replace(" n ", " north ").replace(" rd ", " road ").replace(" blvd "," boulevard ")\
            .replace(" ct "," court ").replace(" ste "," suite ").replace(" suite suite "," suite ")\
            .replace(" pkwy ", " parkway ").replace(" s "," south ").replace(" w ", " west ")\
            .replace(" nw ", " northwest ").replace(" sw ", " south west ")\
            .replace(" ne ", " northeast ").replace(" se ", " south east ")
    addr1 = addr1.replace(" ",'').replace(".","").replace("#","").replace("-","")
    if addr1 in HAVES:
        # print("DUP address found, skip")
        DUPS += 1
        continue
    print("addr1:start:%s:end:%s" % (addr1_s,addr1))
    HAVES[addr1] = 1
    sha = encryption.getSHA256("%s-%s-%s" % (addr1.lower(),name.lower(),zipcode.lower()))
    if sha not in OFF:
        OFF[sha] = {
            'address':{
                'addr1': "%s %s" % (j['Practice Address'],j['Practice Address 2']),
                'city' :j['Practice City'],
                'state':j['Practice State'],
                'zipcode':zipcode
            },
            'email':j['Email'],
            'phone':j['Phone'],
            'website': None,
            'name':j['Company Name'],
            'providers':[]
        }
        OFF[sha]['providers'].append({
            'first_name': j['First-Name'],
            'phone': j['Phone'],
            'email': j['Email'],
            'last_name': j['Last-Name'],
        })
    else:
        print("Duplicate sha found %s" % j)

#print("---")
#print(json.dumps(OFF,indent=4))
# sys.exit(0)

for c in OFF:
    CUST = OFF[c]
    email = CUST['email']
    email = email.lower()
    if email is None or len(email) < 1:
        CUST['email'] = email = "unknown-%s@poundpain.com" % encryption.getSHA256()[:6]
    user_id = 0
    off_id = 0
    l = db.query("""
        select id as f1,email as f2,0 as f3 from office where email = %s
        UNION ALL
        select o.id as f1,oa.name as f2,oa.zipcode as f3
            from office o, office_addresses oa
        where o.name = %s and oa.zipcode = %s
        UNION ALL
        select office_id as f1,phone as f2,0 as f3 from office_addresses oa
        where oa.phone = %s 
        UNION ALL
        select id f1,0 as f2,0 as f3 from users where email=%s
        """,(email,CUST['name'],CUST['address']['zipcode'],CUST['phone'],email)
    )
    for x in l:
        #print(x)
        off_id = x['f1']
    if off_id != 0:
        DUPS += 1
        #print("Office %s (%s) already imported, skipping" % (CUST['name'],CUST['address']['zipcode']))
        continue
    # print(json.dumps(CUST,sort_keys=True))
    print("ins=%s,%s" % (CUST['name'],args.commission))
    CNTR += 1
    db.update("""
        insert into office 
            (name,office_type_id,email,billing_system_id,active,commission_user_id,import_sm)
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
            (%s,3),(%s,7)
            """,(user_id,user_id)
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
    
print("SAVED %s, DUPS %s" % (CNTR,DUPS))
        
