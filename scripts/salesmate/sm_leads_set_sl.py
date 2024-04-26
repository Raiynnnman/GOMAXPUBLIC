#!/usr/bin/python

import os
import random
import traceback
import sys
import traceback
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
from salesmate import sm_util
from salesmate.sm_util import SM_Contacts,SM_Companies,SM_Deals

config = settings.config()
config.read("settings.cfg")

user = config.getKey("sf_user")
passw = config.getKey("sf_pass")
token = config.getKey("sf_token")
inst = config.getKey("sf_instance")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--sm_id', dest="sm_id", action="store")
parser.add_argument('--id', dest="pain_id", action="store")
parser.add_argument('--limit', dest="limit", action="store")
parser.add_argument('--force_sf', dest="force_sf", action="store_true")
parser.add_argument("--sm_only", dest="sm_only", action="store_true")
parser.add_argument('--no_commit', dest="no_commit", action="store_true")
parser.add_argument('--excp_pass', dest="excp_pass", action="store_true")
parser.add_argument('--force_pain', dest="force_pain", action="store_true")
parser.add_argument('--del_dups', dest="del_dups", action="store_true")
parser.add_argument('--doall', dest="do_all", action="store_true")
parser.add_argument('--only_fields', dest="only_fields", action="store")
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--no_new', dest="no_new", action="store_true")
args = parser.parse_args()

TYPE='Lead'
DEALS_OBJ = SM_Deals()

PAIN = []

q = """
    select
        o.id as office_id,u.id as user_id,pq.sm_id,
        pq.id as pq_id,o.active,
        op.id as office_plans_id,pd.id as pricing_data_id,
        o.updated as office_updated,u.updated as users_updated,
        o.name as office_name,pq.sf_id,
        pq.updated as updated01,pq.updated as updated02,
        pqsm.modified as updated03,
        com.id as commission_user_id,com.sm_id as user_sf_id
    from
        provider_queue pq
        left outer join office o on pq.office_id = o.id
        left outer join provider_queue_sf_updated pqsm on pq.id=pqsm.provider_queue_id
        left outer join office_plans op on  op.office_id = o.id
        left outer join pricing_data pd on pd.id = op.pricing_data_id
        left outer join users u on u.id = o.user_id
        left outer join users com on com.id = o.commission_user_id
    where
        1 = 1
        pq.sm_id is not null
    """

DEALS = sm_util.getDeals(debug=args.debug)
for x in DEALS:
    j = DEALS[x]
    n= {
    }
    n['Id'] = j['id']
    n['Sales_Link__c'] = '%s/#/register-provider' % (config.getKey("host_url"),)
    print(j['textCustomField2'])
    pq_id = j['textCustomField1']
    print(pq_id)
    if str(pq_id) not in j['textCustomField2']:
        continue
    try:
        DEALS_OBJ.update(n,dryrun=args.dryrun)
    except Exception as e:
        print("%s : ERROR : %s" % (x,str(e)))
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
    time.sleep(1)
