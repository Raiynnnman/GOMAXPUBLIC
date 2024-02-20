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

# print(json.dumps(xml,indent=2))

for x in xml['ICD10CM.tabular']['chapter']:
    print("=====")
    print(json.dumps(x,indent=2))
    for sect in x['section']:
        if 'diag' not in sect:
            continue
        if isinstance(sect,str):
            print("STR: sect: %s" % sect)
            continue
        print("******")
        print(json.dumps(sect,indent=2))
        print(type(sect))
        if isinstance(sect['diag'],str):
            print("STR: sect: %s" % sect['diag'])
            continue
        if isinstance(sect['diag'],dict):
            sect['diag'] = [sect['diag']]
        for diag in sect['diag']:
            print("+++++")
            print(type(diag))
            print(json.dumps(diag,indent=2))
            base_d = diag['desc']
            if 'diag' not in diag:
                continue
            for diag2 in diag['diag']:
                print("-----")
                print(json.dumps(diag2,indent=2))
                print(type(diag2))
                if isinstance(diag2,str):
                    print("STR: sect: %s" % diag2)
                    continue
                diag2['name'] = diag2['name'].replace("'","''")
                diag2['desc'] = diag2['desc'].replace("'","''")
                dlist = []
                if 'diag' in diag2 and isinstance(diag2['diag'],list):
                    for b in diag2['diag']:
                        b1 = b['desc'].replace("'","''")
                        b2 = b['name'].replace("'","''")
                        print(b1,b2)
                        q = "insert into icd_cm (icd_year_id,code,description) values \n"
                        q += "\t(1,'%s','%s');\n" % (b2,b1)
                        dlist.append(q)
                q = "insert into icd_cm (icd_year_id,code,description) values \n"
                q += "\t(1,'%s','%s');\n" % (diag2['name'],diag2['desc'])
                print(q)
                H = open("icd_cm.sql","a")
                H.write(q)
                if len(dlist) > 0:
                    for q in dlist:
                        H.write(q)
                H.close()

