#!/usr/bin/python

import os
import sys
import json
from datetime import datetime,timedelta

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
import argparse
from util.DBOps import Query

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--user', dest="user", action="store")
args = parser.parse_args()

SCHED={}
db = Query()

db.update("""
    insert into physician_schedule_orphaned
    select 
        * 
    from 
        physician_schedule_scheduled
    where 
        user_id = 1 and
        timestampdiff(minute,created,now()) > 20
    ON DUPLICATE KEY update UPDATED=now()
    """)

db.update("""
    delete from physician_schedule_scheduled 
    where 
        user_id = 1 and
        timestampdiff(minute,created,now()) > 20
    """)

db.commit()
