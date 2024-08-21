#!/usr/bin/python

import os
import sys
import time
import json
import pandas as pd

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
from util import getIDs
import argparse
import requests
from util.DBOps import Query
from util.Mail import Mail
from util.HTMLParser import HTMLParser
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
parser.add_argument('--force', dest="force", action="store_true")
parser.add_argument('--use-cache', dest="usecache", action="store_true")
args = parser.parse_args()

REF = getIDs.getReferrerUserStatus()

db = Query()
#l = db.query("""
#    select id,email,first_name,last_name,zipcode,phone from leads
#    """)
#for x in l:
#    h = encryption.getSHA256(json.dumps(x,sort_keys=True))
#    LEADS[h] = x

custom_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
options = webdriver.ChromeOptions()
options.headless = True
options.page_load_strategy = 'none' 
options.add_argument(f'--user-agent={custom_user_agent}')
chrome_path = ChromeDriverManager().install() 
chrome_service = Service(chrome_path)
driver = Chrome(options=options, service=chrome_service) 
driver.implicitly_wait(5)

PAGE="https://portal.martindalenolo.com/LegalLeads#/all"
path = "screenshots"

if not os.path.exists(path):
    os.makedirs(path)

USER=config.getKey("nolo_user")
PASS=config.getKey("nolo_pass")

tds = []
TDS=[]
page = ''

cache = "%s/%s" % (path,'master-html')
if os.path.exists(cache) and args.usecache:
    H=open(cache)
    page = H.read()
    H.close()
else:
    print("Starting at %s" % PAGE)
    driver.get(PAGE)
    time.sleep(10)
    driver.save_screenshot("%s/%s.png" % (path,"beforelogin4"))
    driver.find_element(By.ID, "username").send_keys(USER)
    driver.find_element(By.ID, "password").send_keys(PASS)
    btn = driver.find_element(By.CLASS_NAME,"login-form-submit")
    btn.click()
    time.sleep(10)
    page = driver.page_source
    driver.save_screenshot("%s/%s.png" % (path,"inquiries"))
    H=open(cache,"w")
    H.write(page)
    H.close()

print("Saving content")
html = HTMLParser()
html.feed(page)
data = html.get()

table = pd.read_html(page)

o = db.query("""
    select id from office where name = 'MARTINDALE'
    """)

OID = o[0]['id']

print(f'Total tables: {len(table)}')
TABLE_WITH_DATA = None
C = 0
for x in table:
    print("table %s" % C)
    df = x.to_dict()
    # print(df)
    VALS=[]
    for row in df:
    #for row in df.itertuples(index=True, name='Pandas'):
        print(row)
        if 'Actions' in row:
            print("FOUND IT: %s" % C)
            TABLE_WITH_DATA = C
            break
    C += 1

print("data_table = %s" % TABLE_WITH_DATA)
df = table[TABLE_WITH_DATA].to_dict(orient='index')
for x in df:
    j = df[x]
    print("----")
    print(j)
    o = db.query("""
        select id from referrer_users where vendor_id = %s
        """,(j['Lead ID'],)
        )
    # print(len(o))
    if len(o) > 0:
        print("Already have")
        continue
    # print("new one!")
    sha = encryption.getSHA256(json.dumps(j,sort_keys=True))
    db.update("""
        insert into referrer_users 
            (
                referrer_id,referrer_users_status_id,row_meta,sha256,name,
                referrer_users_accident_types_id,phone,vendor_id,
                email,price_per_lead,import_location,referrer_users_source_id
            ) 
            values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON DUPLICATE KEY update update_cntr=update_cntr+1
        """,(
            OID,REF['QUEUED'],json.dumps(j),sha,j['Name'],1,j['Phone'],j['Lead ID'],j['Email'],
            j['Price Per Lead'].replace('$',''),j['Location'],5
        )
    )
    insid = db.query("select LAST_INSERT_ID()");
    insid = insid[0]['LAST_INSERT_ID()']
    db.update("""
        insert into referrer_users_history(referrer_users_id,user_id,text)
            values (%s,1,'Imported lead from Martindale')
        """,(insid,)
    )
    db.commit()

sys.exit(0)
