#!/usr/bin/python

import os
import sys
import base64
import pdfkit
from datetime import datetime, timedelta
import time
from jinja2 import Template
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate,S3Processing
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

bucket = config.getKey("document_bucket")
aws_user = config.getKey("document_bucket_access_key")
aws_pass = config.getKey("document_bucket_access_secret")

path="documents/test/test02.pdf"
H = open(args.file,"rb")
content = H.read()
H.close()
b1 = base64.b64encode(content)
b2 = encryption.encrypt(b1.decode('utf-8'),config.getKey("encryption_key"))


# -- TEST1
c1 = encryption.decrypt(b2,config.getKey("encryption_key"))
c2 = base64.b64decode(c1)
H = open("output.pdf","wb")
H.write(c2)
H.close()

#print("content=%s" % encryption.getSHA256(content))
print("b1=%s" % encryption.getSHA256(b1.decode('utf-8')))
print("b2=%s" % encryption.getSHA256(b2))
#print("c2=%s" % encryption.getSHA256(c2.decode('utf-8')))
print("c1=%s" % encryption.getSHA256(c1))

# TEST2
S3Processing.uploadS3ItemToBucket(aws_user,aws_pass,bucket,path,"application/pdf",b2)
content = S3Processing.downloadS3ItemFromBucket(aws_user,aws_pass,bucket,path)
c3 = encryption.decrypt(content.decode('utf-8'),config.getKey("encryption_key"))
c4 = base64.b64decode(c1)
H = open("output2.pdf","wb")
H.write(c4)
H.close()
print("c3=%s" % encryption.getSHA256(c3))

H = open("ssfafaf","rb")
c5 = H.read()
H.close()
c6 = base64.b64decode(c5)
H=open("output3.pdf","wb")
H.write(c6)
H.close()
