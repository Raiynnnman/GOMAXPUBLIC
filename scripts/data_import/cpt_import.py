#!/usr/bin/python

import os
import sys
import time
import json
import pandas as pd

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
import argparse
import requests
from util.DBOps import Query

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

r = requests.get("https://www.hcpcsdata.com/Codes")

V = r.text

HREF=[]
QUERY = ['insert into codes_cpt (code,description) values ']
spl = V.split('<')
for x in spl:
    if 'Codes' not in x:
        continue
    if x.startswith('tr'):
        continue
    if 'href' not in x:
        continue
    href = x.split('href=')
    href = href[1].split(">")
    href = href[0].replace('"',"")
    if href == '/Codes':
        continue
    HREF.append(href)

for x in HREF:
    tables = pd.read_html("https://www.hcpcsdata.com%s" % x)
    df = tables[0]
    for row in df.itertuples(index=True, name='Pandas'):
        desc = row.Description
        desc = desc.replace("'","''")
        QUERY.append("('%s','%s')" % (row.Code,desc))

print('insert into codes_cpt (code,description) values ')
print(",\n".join(QUERY))
