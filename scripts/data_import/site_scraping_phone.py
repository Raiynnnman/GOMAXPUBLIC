#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
import requests

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
import pandas as pd
from nameparser import HumanName
from common import settings
from util import encryption,calcdate
from util import getIDs

import argparse

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--file', dest="file", action="store")
parser.add_argument('--site', dest="site", action="store")
parser.add_argument('--force', dest="force", action="store_true")
args = parser.parse_args()

db = Query()

H=open(args.file,"r")
l=H.readlines()
H.close()

if args.site is not None:
    l = [args.site]

FINAL = []

if not os.path.exists("./out"):
    os.makedirs("./out")

for x in l:
    # print(x)
    x = x.rstrip()
    fname = encryption.getSHA256(x)
    if 'books.google.com' in x:
        FINAL.append({'site':x,'fname':fname,'phone':'N/A'})
        continue
    if 'http' not in x:
        FINAL.append({'site':x,'fname':fname,'phone':'N/A'})
        continue
    if not os.path.exists("./out/%s.html" % fname) or args.force:
        # print("getting site %s" % x)
        try: 
            r = requests.get(x,headers={'user-agent':'curl/7.81.0'},timeout=30)
            j = r.text
            H=open("./out/%s.html" % fname,"w")
            H.write(j)
            H.close()
        except Exception as e:
            H=open("./out/%s.html" % fname,"w")
            H.write('<html>%s</html>' % str(e))
            H.close()
            FINAL.append({'site':x,'fname':fname,'phone':'ERROR: %s' %  str(e)})
    else:
        pass
        # print("using cached file %s" % fname)
        
    H=open("./out/%s.html" % fname,"r")
    j=H.read()
    H.close()
    # print(j)
    tel = j.split('tel:')
    if len(tel) == 1:
        FINAL.append({'site':x,'fname':fname,'phone':'tel not found'})
        continue
    for g in tel:
        if len(g) < 1:
            continue
        if g[0].isdigit():
            ph = g
            break
    ph = ph.split("\n")
    ph = ph[0]
    ph = ph.split("<")
    ph = ph[0]
    ph = ph.split(">")
    ph = ph[0]
    ph = ph.split("target")
    ph = ph[0]
    ph = ph.split("class")
    ph = ph[0]
    ph = ph.split("title")
    ph = ph[0]
    ph = ph.split("content")
    ph = ph[0]
    ph = ph.split("aria")
    ph = ph[0]
    ph = ph.split("data")
    ph = ph[0]
    ph = ph.split("style")
    ph = ph[0]
    ph = ph.split("href")
    ph = ph[0]
    ph = ph.split("onclick")
    ph = ph[0]
    ph = ph.replace('"','').replace("%20",'').replace("'",'')
    p = ph.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p.startswith("+1"):
        p = p.replace("+1","")
    if p.startswith("1") and len(p) == 11:
        p = p[1:]
    ph = p
    # print("ph=%s" % ph)
    print("%s.html - %s - %s" % (fname,x,ph))
    FINAL.append({'site':x,'fname':fname,'phone':ph})

df = pd.DataFrame(FINAL)
df.to_csv("output.csv")

