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

args = parser.parse_args()
db = Query()


o = db.query("""
    select email,count(email) from users u 
    where id in (
        select ou.user_id from office_user ou, office o where ou.office_id=o.id and o.active=0) 
    and email is not null and length(email) > 0
    group by email 
    having 
        count(email) > 1 order by email;
    """)

for x in o:
    print(x)
    g = db.query("""
        select id from users where email = %s
        """,(x['email'],)
    )
    uid = g[0]['id']
    g = db.query("""
        select office_id from office_user where user_id=%s
        """,(uid,)
    )
    if len(g) < 1:
        print("CONTINUE: No office for %s" % uid)
    offid = g[0]['office_id']
    g = db.query("""
        select id from office_plans where office_id=%s
        """,(offid,)
    )
    if len(g) > 0:
        print("ERROR: Picked office (%s) has a plan" % offid)
        continue

    db.update("""
        update provider_queue set provider_queue_status_id=43 where office_id=%s
        """,(offid,)
    )
    db.update("""
        update office set name=uuid(),email=uuid() where id=%s
        """,(offid,)
    )
    db.update("""
        update users set first_name=uuid(),email=uuid(),last_name=uuid(),active=0 where id=%s
        """,(uid,)
    )
    db.commit()
    
