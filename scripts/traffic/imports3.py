#!/usr/bin/python
import requests
import random
import boto3
import os
import sys
import math
import time
import json
sys.path.append(os.getcwd())  # noqa: E402
from common import settings
from util import encryption,calcdate,getIDs
from util import S3Processing
from traffic import traffic_util
import argparse
import requests
from util.DBOps import Query

config = settings.config()
config.read("settings.cfg")

access = config.getKey('document_bucket_access_key')
secret = config.getKey('document_bucket_access_secret')

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--prefix', dest="prefix", action="store")
args = parser.parse_args()

db = Query()
bucket = 'pain-documents-bucket'
prefix = ''
if args.prefix is not None:
    prefix=args.prefix

files = S3Processing.iterateBucket(access,secret,bucket,prefix)

for x in files:
    print(x)
    f = S3Processing.downloadS3ItemFromBucket(access,secret,bucket,x)
    JS = json.loads(f)
    # print(JS)
    s = x.split('/')
    city = s[0]
    s = s[len(s)-1]
    zipcode = s.split('+')[1]
    zipcode = zipcode.replace('.json','')
    print(s,zipcode,city)
    l = db.query("""
        select lat,lon from position_zip where zipcode=%s
        """,(zipcode,)
    )
    traffic_util.importTraffic(db,JS,'','',zipcode,l[0]['lat'],l[0]['lon'])
    print("-----")


print("-----")
print("Done")

