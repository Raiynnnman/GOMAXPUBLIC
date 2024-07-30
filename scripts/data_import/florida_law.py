#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
import bs4
import requests

sys.path.append(os.getcwd())  # noqa: E402

from salesmate import sm_util
from salesmate.sm_util import SM_Contacts,SM_Companies,SM_Deals
from util.DBOps import Query
import pandas as pd
from common import settings
from util import encryption,calcdate
from util import getIDs
from bs4 import BeautifulSoup
from selenium import webdriver 
from selenium.webdriver import Chrome 
from selenium.webdriver.chrome.service import Service 
from selenium.webdriver.common.by import By 
from webdriver_manager.chrome import ChromeDriverManager

from nameparser import HumanName
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('files', nargs="*")
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--no_commit', dest="no_commit", action="store_true")
parser.add_argument('--pages', dest="pages", action="store")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

options = webdriver.ChromeOptions()
options.headless = True
options.page_load_strategy = 'none' 
custom_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
options.add_argument(f'--user-agent={custom_user_agent}')
chrome_path = ChromeDriverManager().install() 
chrome_service = Service(chrome_path)
driver = Chrome(options=options, service=chrome_service) 
driver.implicitly_wait(5)

BASE='https://www.floridabar.org'

FINAL = []
def loadPage(u):
    path = "./webscraping"
    url = u
    CACHED = False
    print("u=%s" % u)
    fname = encryption.getSHA256(u)
    F = "%s/%s.html" % (path,fname)
    T = "%s/%s.png" % (path,fname)
    print("url=%s" % url)
    if not os.path.exists(path):
        os.makedirs(path)
    html = None
    if os.path.exists(F):
        print("Loading cached file: %s" % F)
        H = open(F,"r")
        CACHED = True
        html = H.read()
        H.close()
    else:
        print("fetching content: %s" % u)
        driver.get(url)
        time.sleep(10)
        path = "webscraping/"
        if not os.path.exists(path):
            os.makedirs(path)
        print("saving screenshot: %s" % T)
        driver.save_screenshot(T)
        print("saving content: %s" % F)
        H = open(F,"w")
        html = driver.page_source
        H.write(html)
        H.close()
    return (CACHED,html)

def parsePage(j):
    print("parsepage: %s" % j)
    j = j.replace("\r\n","")
    j = j.replace("\n","")
    global FINAL
    tags = j.split('profile-identity">') 
    tags.pop(0)
    C = 0
    CONTENT = {}
    while C < len(tags):
        print("+++NEXT_RECORD")
        print(json.dumps(CONTENT,indent=4))
        print("---NEXT_RECORD")
        if len(CONTENT) > 0:
            FINAL.append(CONTENT)
            CONTENT={}
        v = tags[C]
        v = tags[C].split("<div ")
        D = 0
        while D < len(v):
            y=v[D]
            print(y)
            if 'profile-contact' in y:
                cont = y.split("<")
                print("contact=%s" % json.dumps(cont,indent=4))
                for g in cont:
                    print("contact_g=%s" % g)
                    if 'p>' in g and 'office' not in CONTENT:
                        CONTENT['office'] = g.replace("p>","")
                        continue
                    if 'br>' in g and 'address' not in CONTENT:
                        CONTENT['address'] = g.replace("br>","")
                        continue
                    if 'br>' in g and 'city' not in CONTENT:
                        CONTENT['city'] = g.replace("br>","")
                        continue
                    if 'a href' in g and 'phone' not in CONTENT:
                        CONTENT['phone'] = g.split(">")[1]
                        continue
                    if 'icon-email' in g and 'email' not in CONTENT:
                        e = g.split("href=")
                        e = e[1]
                        e = e.split(" ")[0]
                        e = e.replace('"','')
                        e = e.replace('mailto:','')
                        CONTENT['email'] = e
                        print("em",e)
                        continue
            if 'eligibility' in y:
                cont = y.split(">")
                CONTENT['eligible'] = cont[1].replace("</div","")
            if 'profile-content' in y:
                cont = y.split(">")
                for g in cont:
                    if '</a' in g:
                        CONTENT['name'] = g.replace("</a","")
                    if '</span' in g:
                        CONTENT['license'] = g.replace("</a","").replace("</span","")
                print("cont=%s" % cont)
            D += 1
        C += 1

C = 0
while C < int(args.pages):
    print("Doing %s of %s" % (C,args.pages))
    u = "directories/find-mbr/?sdx=N&eligible=N&deceased=N&pracAreas=P02&pageNumber=%s&pageSize=50" % C
    (CACHED,html) = loadPage("%s/%s" % (BASE,u))
    # print("-----")
    # print(html)
    parsePage(html)
    if args.limit is not None:
        if C > int(args.limit):
            break
    if not CACHED:
        print("Sleeping for next page")
        time.sleep(60)
    C += 1

print("FINAL+====",len(FINAL))
print(json.dumps(FINAL,indent=4))
df1 = pd.DataFrame.from_dict(FINAL)
df1.to_csv("attorney_export.csv")
