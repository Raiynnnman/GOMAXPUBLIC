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

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
args = parser.parse_args()

db = Query()

o = db.query("""
    select oa.office_id,u.phone user_phone,oa.phone office_phone,u.id as user_id 
    from 
        users u,office_addresses oa,office_user ou,office o
    where 
        ou.office_id = o.id and
        ou.user_id=u.id and 
        oa.office_id=ou.office_id and
        oa.phone is not null and
        u.phone is null
    """)

CNTR = 0
for x in o:
    db.update("""update users set phone = %s where id = %s
        """,(x['office_phone'],x['user_id'])
    )
    CNTR += 1

db.commit()

print("Updated %s records" % CNTR)
