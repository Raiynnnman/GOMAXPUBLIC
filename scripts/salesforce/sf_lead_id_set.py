#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
from nameparser import HumanName

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs
from salesforce import sf_util

import argparse
from simple_salesforce import Salesforce

config = settings.config()
config.read("settings.cfg")

user = config.getKey("sf_user")
passw = config.getKey("sf_pass")
token = config.getKey("sf_token")
inst = config.getKey("sf_instance")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()
db = Query()

sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)

o = db.query("""
    select pq.id,pq.sf_id from provider_queue pq,office o 
    where 
    pq.sf_id is not null and o.import_sf=1 and o.id=pq.office_id;
""")

CNTR = 0
for x in o:
    j = {}
    j['PainID__c'] = x['id']
    i = x['sf_id']
    j['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),x['id'])
    print(i,j)
    if not args.dryrun:
        try:
            r = sf.Lead.update(i,data=j)
        except Exception as e:
            print("%s: %s" % (i,str(e)))
    CNTR += 1
    if args.limit is not None and CNTR > int(args.limit):
        break
