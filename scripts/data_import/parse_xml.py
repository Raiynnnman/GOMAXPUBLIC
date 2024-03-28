#!/usr/bin/python

import os
import random
import xmltodict
import sys
from datetime import datetime, timedelta
import time
import simplejson as json
from googleplaces import GooglePlaces, types, lang

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
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

H=open(args.file,'r')
j = H.read()
js = xmltodict.parse(j)
p = js['build']['actions']['hudson.model.ParametersAction']['parameters']['hudson.model.StringParameterValue']
# print(p)
for x in p:
    if x['name']=='OFFICE':
        print(x['value'])
# print(json.dumps(js,indent=4))


# 10


