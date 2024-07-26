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
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

options = webdriver.ChromeOptions()
options.headless = True
options.page_load_strategy = 'none' 
chrome_path = ChromeDriverManager().install() 
chrome_service = Service(chrome_path)
driver = Chrome(options=options, service=chrome_service) 
driver.implicitly_wait(5)

BASE='https://www.floridabar.org'

def loadPage(u):
    print("u=%s" % u)
    ret = 'unknown@gmail.com'
    url = '%s%s' % (BASE,u)
    print("url=%s" % url)
    driver.get(url)
    time.sleep(10)
    path = "webscraping/"
    if not os.path.exists(path):
        os.makedirs(path)
    fname = encryption.getSHA256(u)
    driver.save_screenshot("%s/%s.png" % (path,fname))
    #body = driver.find_element(By.TAG_NAME,"body")
    #body = body.text
    # content = driver.find_element(By.CLASS_NAME,"profiles-compact")
    p_s = driver.find_elements(By.CLASS_NAME, "profile-identity")
    print(len(p_s))
    for p in p_s:
        v = p.get_attribute("innerHTML")
        print(v)
    return ret


loadPage("https://www.floridabar.org/directories/find-mbr/?sdx=N&eligible=N&deceased=N&pracAreas=P02&pageNumber=1&pageSize=50")
sys.exit(0)

def loadBrowserForEmail(u):
    print("u=%s" % u)
    ret = 'unknown@gmail.com'
    url = '%s%s' % (BASE,u)
    print("url=%s" % url)
    driver.get(url)
    time.sleep(10)
    path = "webscraping/"
    if not os.path.exists(path):
        os.makedirs(path)
    fname = encryption.getSHA256(u)
    driver.save_screenshot("%s/%s.png" % (path,fname))
    body = driver.find_element(By.TAG_NAME,"body")
    body = body.text
    print("BODY----")
    print(body)
    return ret

if args.files is None:
    print("ERROR: Subs File required")
    sys.exit(1)

for x in args.files:
    print(x)
    H=open(x,"r")
    j=H.read()
    H.close()
    j = j.replace("\r\n","")
    j = j.replace("\n","")
    print(j)
    print("----")
    tags = j.split('profile-identity">') 
    tags.pop(0)
    FINAL = []
    C = 0
    CONTENT = {}
    while C < len(tags):
        print("NEXT_RECORD")
        if len(CONTENT) > 0:
            FINAL.append(CONTENT)
            CONTENT={}
            break
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
                    if 'br>' in g and 'address' not in CONTENT:
                        CONTENT['address'] = g.replace("br>","")
                    if 'br>' in g and 'city' not in CONTENT:
                        CONTENT['city'] = g.replace("br>","")
                    if 'a href' in g and 'phone' not in CONTENT:
                        CONTENT['phone'] = g.split(">")[1]
                    if 'email-protection' in g and 'email' not in CONTENT:
                        e = g.split("href=")
                        e = e[1]
                        e = e.split(" ")[0]
                        e = e.replace('"','')
                        CONTENT['email'] = loadBrowserForEmail(e)
                        print("em",e)
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
    break

print("FINAL+====")
print(json.dumps(FINAL,indent=4))
