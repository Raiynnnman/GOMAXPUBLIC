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

l = db.query("""
     select id,state from office_addresses where length(state) > 2
    """)

for x in l:
    o = db.query("""
        select code1 from position_zip where name1 = %s
        """,(x['state'],)
    )
    if len(o) < 1:
        continue
    # print(x)
    db.update("""
        update office_addresses set state = %s where id = %s
        """,(o[0]['code1'],x['id'])
    )

l = db.query("""
     select id,zipcode from office_addresses where locate('.',zipcode) > 1
    """)

for x in l:
    z = str(int(float(x['zipcode'])))
    db.update("""
        update office_addresses set zipcode=%s where id = %s
        """,(z,x['id'])
    )

db.update("""
    update office_addresses set state=upper(state) where upper(state) <> state
    """
)

db.commit()
