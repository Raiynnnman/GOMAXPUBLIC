#!/usr/bin/python

import os
import random
import sqlite3
import ipaddress
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
db = Query()

con = None
if os.path.exists("./bin/data/ipmapping.db"):
    F="./bin/data/ipmapping.db"
    con = sqlite3.connect(F, check_same_thread=False)
else:
    print("No database to pull from")
    sys.exit(1)

o = db.query("""
    select id,ip from performance where lat=0
    """)

curs = con.cursor()

for x in o:
    g = 0
    try:
        g = int(ipaddress.ip_address(x['ip']))
    except:
        continue
    q = """select 
            latitude, longitude, continent, 
            country, stateprov, city 
           from dbip_lookup where ? between ip_st_int and ip_en_int
        """
    j = {}
    curs.execute(q, (g,))
    for n in curs:
        j['lat'] = n[0] 
        j['lon'] = n[1]
        j['continent'] = n[2]
        j['country'] = n[3]
        j['stateprov'] = n[4]
        j['city'] = n[5]
        break
    db.update("""
        update performance set 
                lat=%s,lon=%s,country=%s,
                state=%s,city=%s,ms=%s,ip=%s,continent=%s
            where id=%s
        """,(j['lat'],j['lon'],j['country'],
             j['stateprov'],j['city'],j['ms'],
             j['ip'],j['continent'],x['id']
            )
    )
    db.commit()


