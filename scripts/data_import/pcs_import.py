#!/usr/bin/python

import os
import sys
import time
import json
import xmltodict

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
import argparse
import requests
from util.DBOps import Query
from bs4 import BeautifulSoup
from selenium import webdriver 
from selenium.webdriver import Chrome 
from selenium.webdriver.chrome.service import Service 
from selenium.webdriver.common.by import By 
from webdriver_manager.chrome import ChromeDriverManager


config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

H=open(args.file,"r")
c=H.read()
H.close()

xml = xmltodict.parse(c)

def parseAxis(axis):
    pass

for row in xml['ICD10PCS.tabular']['pcsTable']:
    print("====")
    print(json.dumps(row,indent=2))
    base_c = []
    base_d = ''
    for axis in row['axis']:
        base_c.append(axis['label']['@code'])
        base_d = axis['label']['#text']
    print("++++")
    print(row['pcsRow'])
    pcsRow = row['pcsRow']
    if isinstance(row['pcsRow'],dict):
        pcsRow = [pcsRow]
    for pcs in pcsRow:
        print("----")
        print(pcs)
        body_c = []
        body_d = []
        approach_c = []
        approach_d = []
        device_c = []
        device_d = []
        qual_c = []
        qual_d = []
        for axis in pcs['axis']:
            if axis['title'] == 'Body Part':
                if isinstance(axis['label'],dict):
                    body_c.append(axis['label']['@code'])
                    body_d.append(axis['label']['#text'])
                else:
                    for body in axis['label']:
                        body_c.append(body['@code'])
                        body_d.append(body['#text'])
            if axis['title'] == 'Approach':
                if isinstance(axis['label'],dict):
                    approach_c.append(axis['label']['@code'])
                    approach_d.append(axis['label']['#text'])
                else:
                    for approach in axis['label']:
                        approach_c.append(approach['@code'])
                        approach_d.append(approach['#text'])
            if 'Device' in axis['title']:
                if isinstance(axis['label'],dict):
                    device_c.append(axis['label']['@code'])
                    device_d.append(axis['label']['#text'])
                else:
                    for device in axis['label']:
                        device_c.append(device['@code'])
                        device_d.append(device['#text'])
            if axis['title'] == 'Qualifier':
                if isinstance(axis['label'],dict):
                    qual_c.append(axis['label']['@code'])
                    qual_d.append(axis['label']['#text'])
                else:
                    for qual in axis['label']:
                        qual_c.append(qual['@code'])
                        qual_d.append(qual['#text'])
                fin = {'d':[],'c':[]}
                for b in body_c:
                    for a in approach_c:
                        for d in device_c:
                            for q in qual_c:
                                fin['c'].append("%s%s%s%s%s" % (''.join(base_c),b,a,d,q)) 
                for b in body_d:
                    for a in approach_d:
                        for d in device_d:
                            for q in qual_d:
                                fin['d'].append("%s %s %s %s %s" % (base_d, b,a,d,q)) 
                if len(fin['d']) != len(fin['c']):
                    raise Excception("length mismatch")
                C = 0
                final = []
                while C < len(fin['d']):
                    final.append({
                        'description': fin['d'][C],
                        'code': fin['c'][C]
                    })
                    C += 1
                H = open("icdpcs.sql","a")
                for x in final:    
                    if len(x['code']) != 7:
                        raise Exception("ERROR: Code is wrong length %s" % x['code'])
                    x['description'] = x['description'].replace("'","''")
                    q = "insert into icd_pcs (description,code,icd_year_id) values\n"
                    q += "\t('%s','%s',%s);\n" % (x['description'],x['code'],1)
                    H.write(q)
                    print(q)
                H.close()
                # print(json.dumps(final,indent=2))
            
