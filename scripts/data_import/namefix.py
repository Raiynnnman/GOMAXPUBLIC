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
from nameparser import HumanName
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
    select o.name,u.id from users u,office o where o.user_id = u.id and u.first_name = 'Unknown';
    """)

for x in o:
    if 'Dr' in x['name'] or 'd.c.' in x['name'].lower() or 'dc' in x['name'].lower():
        t1 = HumanName(x['name'])
        first = "%s %s" % (t1.title,t1.first)
        last = "%s %s" % (t1.last,t1.suffix)
        db.update("""update users set first_name = %s, last_name = %s where id = %s
            """,(first,last,x['id'])
        )
db.commit()
