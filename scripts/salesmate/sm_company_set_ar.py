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
COMPANY_OBJ = SM_Companies()
COMPANY_OBJ.setDebug(True)

PAIN = []
INV = getIDs.getInvoiceIDs()
db = Query()

q = """
    select
        o.id,o.name,o.sm_id,
        op.id plan_id,pd.description,op.end_date,
        op.end_date < now() as expired,
        max(billing_period) as billing_period,
        datediff(op.end_date,now()) as days,
        i.invoice_status_id,
        isi.name
    from
        office o
        left outer join office_plans op on op.office_id = o.id
        left outer join pricing_data pd on pd.id = op.pricing_data_id
        left outer join invoices i on i.office_id = o.id
        left outer join invoice_status isi on i.invoice_status_id = isi.id
    where
        o.active = 1 
        and o.office_type_id = 1
        and o.sm_id is not null
    group by
        o.id
    """

o = db.query(q)

# COMPANIES = sm_util.getCompanies(debug=args.debug)
for x in o:
    custs = db.query("""
        select count(id) as cnt from client_intake_offices where
        office_id = %s
        """,(x['id'],)
    )
    custs = custs[0]['cnt']
    x['custs'] = custs
    print(x)
    ar = 0
    if x['custs'] == 0:
        ar = 0
    elif x['expired'] == 0:
        ar = 0
    else:
        ar = x['days']
    n= { }
    n['id'] = x['sm_id']
    n['intCustomField1'] = ar
    try:
        COMPANY_OBJ.update(n,dryrun=args.dryrun,raw=True)
    except Exception as e:
        print("%s : ERROR : %s" % (x,str(e)))
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
    break
    time.sleep(1)
