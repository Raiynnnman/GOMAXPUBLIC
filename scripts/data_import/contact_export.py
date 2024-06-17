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
from salesmate import sm_util
from salesmate.sm_util import SM_Contacts,SM_Companies,SM_Deals

import argparse
from nameparser import HumanName

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()


CONTACT_OBJ = SM_Contacts()


CONTACTS = sm_util.getContacts(debug=args.debug)

DNC = []
EXPORT = []
OTHER = []
ALL  = []

print("len=%s" % len(CONTACTS))

for x in CONTACTS:
    j = CONTACTS[x]
    print('[%s]' % j['type'])
    j['company_name'] = j['company']['name']
    j['company_id'] = j['company']['id']
    del j['company']
    del j['lastModifiedAt']
    del j['lastModifiedBy']
    del j['lastNoteAddedBy']
    del j['createdBy']
    if j['type'] is None or len(j['type']) < 1:
        EXPORT.append(j)
    if 'missing info' in j['type'].lower():
        EXPORT.append(j)
    elif 'did not ans' in j['type'].lower():
        EXPORT.append(j)
    elif 'dnc' in j['type'].lower():
        DNC.append(j)
    elif 'not interested' in j['type'].lower():
        DNC.append(j)
    else:
        OTHER.append(j)
    ALL.append(j)

df1 = pd.DataFrame.from_dict(DNC)
df1.to_csv("sales-mate-dnc.csv")

df2 = pd.DataFrame.from_dict(EXPORT)
df2.to_csv("sales-mate-untouched.csv")

df3 = pd.DataFrame.from_dict(OTHER)
df3.to_csv("sales-mate-touched.csv")

df4 = pd.DataFrame.from_dict(ALL)
df4.to_csv("sales-mate-all.csv")
