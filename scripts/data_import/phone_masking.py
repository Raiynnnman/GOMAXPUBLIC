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

db.update("""
    update office_addresses set phone = replace(phone,'+1','')
        where phone like '+1%'
    """)
db.update("""
    update office_addresses set phone = replace(phone,'(','')
        where locate('(',phone) > 0;
    """)
db.update("""
    update office_addresses set phone = replace(phone,')','')
        where locate(')',phone) > 0;
    """)
db.update("""
    update office_addresses set phone = replace(phone,' ','')
        where locate(' ',phone) > 0;
    """)
db.update("""
    update office_addresses set phone = replace(phone,'-','')
        where locate('-',phone) > 0;
    """)
db.commit()
