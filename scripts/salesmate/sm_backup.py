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
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--debu', dest="debug", action="store_true")
args = parser.parse_args()

CONTACTS = sm_util.getContacts(debug=args.debug)
DEALS = sm_util.getDeals(debug=args.debug)
COMPANIES = sm_util.getCompanies(debug=args.debug)
USERS = sm_util.getUsers(debug=args.debug)
ACTIVITY = sm_util.getActivity(debug=args.debug)



