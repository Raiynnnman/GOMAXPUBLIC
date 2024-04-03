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
    select id,lat,lon from search_no_results 
        where zipcode is null and lat <> 0
    """)

for x in l:
    #print(x)
    o = db.query("""
        select 
            zipcode,
            st_distance_sphere(point(%s,%s),point(lon,lat))*.000621371192 as dist
        from 
            position_zip
        where 
           st_distance_sphere(point(%s,%s),point(lon,lat))*.000621371192  < 5
        order by 
            st_distance_sphere(point(%s,%s),point(lon,lat))*.000621371192
    """,(
        x['lon'],x['lat'],
        x['lon'],x['lat'],
        x['lon'],x['lat']
        )
    )
    if len(o) < 1:
        print("No zipcode found for %s,%s" % (x['lat'],x['lon']))
        continue
    #print("dist=%s" % o[0]['dist'])
    #print("zip=%s" % o[0]['zipcode'])
    db.update("""
        update search_no_results set zipcode = %s where id = %s
    """,(o[0]['zipcode'],x['id'])
    )
    db.commit()
