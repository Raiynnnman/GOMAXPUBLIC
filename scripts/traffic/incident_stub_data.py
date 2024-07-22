#!/usr/bin/python
import requests
import random
from datetime import datetime, timedelta,date
import calendar
import os
import sys
import math
import time
import json
import random
sys.path.append(os.getcwd())  # noqa: E402
from common import settings
from util import encryption,calcdate,getIDs
from traffic import traffic_util
import argparse
import requests
from util.DBOps import Query

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--usecache', dest="usecache", action="store_true")
parser.add_argument('--distance', dest="distance", action="store")
args = parser.parse_args()

FIRSTS = getIDs.getFirstNames()
LASTS = getIDs.getLastNames()
AREA_CODES = getIDs.getAreaCodes()

db = Query()
l = db.query("""
    select id,city,state,created from traffic_incidents
    where 
        traffic_incidents_contact_id is null and
        traffic_categories_id = 2
    """)

def getNames():
    random.shuffle(FIRSTS)
    f = FIRSTS[0]['value']
    random.shuffle(LASTS)
    l = LASTS[0]['value']
    return f,l

for x in l:
    print(x)
    i = x['id']
    city = x['city']
    state = x['state']
    year = random.randrange(30) + 1983
    month = str(random.randrange(11)+1).zfill(1)
    print("y,m=%s,%s" % (year,month))
    f = None
    l = None
    C = 0
    found = False
    while C < 25:
        f,l = getNames()
        print(f)
        print(l)
        j = db.query("""
            select tic.id 
            from 
                traffic_incidents_contact tic,
                traffic_incidents ti
            where
                ti.traffic_incidents_contact_id = tic.id and
                tic.first_name = %s and tic.last_name = %s
            """,(
                f,l
            )
        )
        if len(j) < 1:
            found = True
            C = 26
            break
        
    if not found:
        print("ERROR: Couldnt find a good name for %s" % x['id'])
        sys.exit(0)
    if l is None or f is None:
        print("ERROR: last or first is null! for %s" % x['id'])
        sys.exit(0)
    ac = db.query("""
        select name1 from position_zip where code1 = %s
        """,(state,)
    )
    if len(ac) < 1:
        print("ERROR: no area_code for %s" % state)
        sys.exit(0)
    ac = ac[0]['name1']
    ac = AREA_CODES[ac]
    random.shuffle(ac)
    ac = ac[0]
    day = random.randrange(31)
    dob = "%s-%s-%s" % (year,month,day)
    try:
        dob = date(
            year,month,day
        )
    except:
        r = calendar.monthrange(int(year),int(month))
        dob = date(int(year),int(month),r[1])
    print("dob=%s" % dob)
    hand = "%s%s%s" % (f[2:],l,str(year)[2:])
    hand = hand.lower()
    print("hand=%s" % hand)
    email = "%s%s%s@gmail.com" % (f[2:],l,str(year)[2:])
    email = email.lower()
    num1 = random.randrange(999)
    num2 = random.randrange(9999)
    minutes = random.randrange(10)
    min_updated = db.query("""
        select date_add(%s,INTERVAL %s minute) as t
        """,(x['created'],minutes)
    )
    stat_d = [1,10,20]
    v = random.randrange(3)
    print("v=%s" % v)
    stat = stat_d[v]
    phone = "%s%s%s" % (ac,num1,num2)
    print("phone=%s" % phone)
    print("email=%s" % email)
    print("stat=%s" % stat)
    db.update("""
        insert into traffic_incidents_contact (
            first_name,last_name,twitter,
            facebook,instagram,email,phone,dob,
            contacted,client_intake_status_id
        ) values (
            %s,%s,%s,%s,%s,%s,%s,%s,%s,%s
        ) 
        """,(
            f,l,hand,hand,hand,email,phone,dob,
            min_updated[0]['t'],stat
        )
    )
    ins = db.query("select LAST_INSERT_ID()")
    ins = ins[0]['LAST_INSERT_ID()']
    db.update("""
        update traffic_incidents set traffic_incidents_contact_id = %s
            where id = %s
        """,(ins,x['id'])
    )
    db.commit()
