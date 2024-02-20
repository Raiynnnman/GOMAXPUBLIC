#!/usr/bin/python

import os
import sys
import time
import json
import pandas as pd
import csv

sys.path.append(os.getcwd())  # noqa: E402

from geopy import distance
from common import settings
from util import encryption,calcdate
import argparse
config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()


H=open(args.file,"r")
R=H.read()
H.close()

j = json.loads(R)

FIN=[]
CA_LAT=[33.814112,-118.354116]
TX_LAT=[29.7528426,-95.3855379]
FIELDS1=[
   'muns','latitude','longitude','zip_code','state' ,
    'has_self_funded_plans'
]
FIELDS2=[
    'company_name','city','email',
    'first_name','last_name','phone_number',
    'prefix','suffix', 'is_a_person'
]

for x in j:
    for y in x['results']:
        if 'muns' in y:
            muns = y['muns']
            H=open('output/%s' % muns,"r")
            R=H.read()
            m = json.loads(R)
            H.close()
            m = m['contacts']
            for c in m:
                Q={}
                for x in FIELDS1:
                    Q[x] = y[x]
                for x in FIELDS2:
                    Q[x] = c[x]
                if Q['state'] == 'CA':
                    Q['dist'] = float(distance.distance(CA_LAT,[Q['latitude'],Q['longitude']]).miles)
                else:
                    Q['dist'] = float(distance.distance(TX_LAT,[Q['latitude'],Q['longitude']]).miles)
                FIN.append(Q)

print(FIN)
with open("zywave.csv","w",newline="\n") as csvfile:
    fields=FIELDS1
    fields += FIELDS2
    fields.append('dist')
    writer=csv.DictWriter(csvfile,fieldnames=fields)
    writer.writeheader()
    for x in FIN:
        writer.writerow(x)


