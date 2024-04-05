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

import argparse
from nameparser import HumanName
import stripe
config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

db = Query()

if args.file is None:
    print("ERROR: Subs File required")
    sys.exit(1)

if not os.path.exists(args.file):
    print("ERROR: Subs File missing")
    sys.exit(1)


df = pd.read_excel(args.file)
df = df.fillna(0)
df = df.to_dict(orient='index')
OFF = {}
for x in df:
    j = df[x]
    if j['id'] == 0:
        continue
    del j['Unnamed: 1']
    myid = int(j['id'])
    s = j['doctor']
    if str(s) == '0':
        s = ''
    OFF[myid] = {}
    n = HumanName(s)
    if '.' not in n.title and 'Dr' in n.title:
        n.title = "%s." % n.title
    n.suffix = n.suffix.replace('D.C', 'DC')
    n.suffix = n.suffix.replace('D.C.', 'DC')
    n.suffix = n.suffix.replace('DC.', 'DC')
    n.suffix = n.suffix.replace('DC', ', DC')
    n.last = n.last.rstrip()
    n.first = n.first.rstrip()
    OFF[myid]['title'] = n.title
    OFF[myid]['first'] = "%s %s" % (n.first,n.middle)
    OFF[myid]['last'] = "%s %s" % (n.last,n.suffix)
    if ' , D' in OFF[myid]['last']:
        OFF[myid]['last'] = OFF[myid]['last'].replace(" , D",", D")
    OFF[myid]['last'] = OFF[myid]['last'].rstrip()
    OFF[myid]['practice'] = j['practice name']
    OFF[myid]['address'] = [{
        'addr':j['address'],
        'city':j['city'],
        'state':j['state'],
        'zipcode':int(j['zipcode']),
        'phone':j['phone']
    }] 
    OFF[myid]['email'] = j['email'].rstrip().lstrip()
    if str(j['address2']) != "0":
        OFF[myid]['address'].append({
            'addr':j['address2'],
            'city':j['city.1'],
            'state':j['state.1'],
            'phone':j['phone'],
            'zipcode':int(j['zipcode.1'])
        }) 
    if str(j['address3']) != "0":
        OFF[myid]['address'].append({
            'addr':j['address3'],
            'city':j['city.2'],
            'state':j['state.2'],
            'phone':j['phone'],
            'zipcode':int(j['zipcode.2'])
        }) 
    if str(j['address4']) != "0":
        OFF[myid]['address'].append({
            'addr':j['address4'],
            'city':j['city.3'],
            'state':j['state.3'],
            'phone':j['phone'],
            'zipcode':int(j['zipcode.3'])
        }) 

for x in OFF:
    j = OFF[x]
    myid = x
    print(j)
    o = db.query("""
        select user_id from office_user
            where office_id = %s
        """,(myid,)
    )
    userid = 0
    if len(o) < 1:
        print("Warning: No ou for %s" % myid)
    else:
        userid = o[0]['user_id']

    if userid != 0:
        db.update("""
            update users set title=%s,first_name=%s,last_name=%s
                where id = %s
            """,(j['title'],j['first'],j['last'],userid)
        )
    db.update("""
        update office set email = %s,name=%s 
            where id = %s
        """,(j['email'],j['practice'],myid)
    )
    db.update("""
        delete from office_addresses where office_id = %s
        """,(myid,)
    )
    for t in j['address']:
        if str(t['phone']) == "0":
            t['phone'] = None
        db.update("""
            insert into office_addresses(office_id,addr1,city,state,zipcode,lat,lon,phone)
                values
                (%s,%s,%s,%s,%s,0,0,%s)
            """,(myid,t['addr'],t['city'],t['state'],t['zipcode'],t['phone'])
        )
    db.commit()
    
        
