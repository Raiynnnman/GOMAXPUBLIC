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
parser.add_argument('--file', dest="file", action="store")

H=open("sm_users.json","r")
js=H.read()
js=json.loads(js)
H.close()

for x in js:
    j = js[x]

    tmp = """
set @email = '__EMAIL__';
set @first_n = '__FIRST__';
set @last_n = '__LAST__';
insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    @email,
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @first_n,
    @last_n,
    '',
    ''
);

set @v=LAST_INSERT_ID();
insert into user_entitlements(user_id,entitlements_id) values
(@v,14);
    """

    f = tmp.replace("__EMAIL__",j['email'].lower())
    f = f.replace("__FIRST__",j['firstName'])
    f = f.replace("__LAST__",j['lastName'])

    print(f)
