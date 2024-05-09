
#!/usr/bin/python

import os
import sys
from datetime import datetime, timedelta,date
import calendar
import time
import json
import requests

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs

import argparse
import stripe
config = settings.config()
config.read("settings.cfg")

key = config.getKey("stripe_key")
stripe.api_key = key
parser = argparse.ArgumentParser()
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()


H=open(args.file,"r")
js=json.loads(H.read())
H.close()

url = 'https://api.poundpain.com/register/provider'
r = requests.post(url,json=js)
print(r.text)
