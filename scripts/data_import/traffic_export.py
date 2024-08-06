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

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--file', dest="file", action="store")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()
db = Query()


DNC = []
EXPORT = []
OTHER = []
ALL  = []

q = """
    select 
        ti.id, ti.traffic_poll_attempt_id, ti.uuid, ti.vendor_id,
        ti.probability, ti.city, ti.state, ti.zipcode, ti.lat, ti.lon,
        ti.traf_from, ti.traf_to, ti.traf_magnitude, ti.traf_start_time,
        ti.traf_end_time, ti.traf_delay, ti.traf_num_reports, 
        ti.feature_type, 
        ti.traffic_categories_id, tc.name as category
    from 
        traffic_incidents ti,
        traffic_categories tc
    where
         ti.traffic_categories_id=tc.id
    """

if args.limit is not None:
    q += " limit %s " % args.limit

o = db.query(q)

H=open(args.file,"w")
H.write(json.dumps(o,indent=4))
H.close()


