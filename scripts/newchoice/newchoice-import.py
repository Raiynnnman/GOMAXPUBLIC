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
from util.Mail import Mail
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

LEADS={}

db = Query()
l = db.query("""
    select id,email,first_name,last_name,zipcode,phone from leads
    """)
for x in l:
    h = encryption.getSHA256(json.dumps(x,sort_keys=True))
    LEADS[h] = x

# print(LEADS)

# Payload
#ReturnUrl: 
#__RequestVerificationToken: oRCbSTL-_7Hhah8TBlmuVrlTjlJHs1Xf2LqpjQhnSASOPMzTi5tucLP0uxkEVJVAFIcgMaF739IhHEE4qqWWhYa2My5H1N6RmuU4QaGOv0M1
#Email: paulmaszy@gmail.com
#Password: Captain1212!
#RememberMe: true
#RememberMe: false

options = webdriver.ChromeOptions()
options.headless = True
options.page_load_strategy = 'none' 
chrome_path = ChromeDriverManager().install() 
chrome_service = Service(chrome_path)
driver = Chrome(options=options, service=chrome_service) 
driver.implicitly_wait(5)
START="https://www.newchoicehealth.com/customers"
POST="https://www.newchoicehealth.com/customers/Login"
path = "screenshots"

if not os.path.exists(path):
    os.makedirs(path)

USER=config.getKey("nch_user")
PASS=config.getKey("nch_pass")

tds = []
TDS=[]
page = ''
if not args.usecache:
    driver.get(START)
    time.sleep(5)
    print("Logging in")
    driver.find_element(By.ID, "Email").send_keys(USER)
    driver.find_element(By.ID, "Password").send_keys(PASS)
    btn = driver.find_element(By.CLASS_NAME,"btn")
    btn.click()
    time.sleep(10)
    driver.save_screenshot("%s/%s.png" % (path,"afterlogin"))
    print("Moving to inquiries")
    driver.get("https://www.newchoicehealth.com/partners/Inquiries")
    time.sleep(10)
    page = driver.page_source
    driver.save_screenshot("%s/%s.png" % (path,"inquiries"))
    try:
        content = driver.find_element(By.TAG_NAME,"table")
        tds = content.find_elements(By.TAG_NAME, "td")
        for x in tds:
            v = x.get_attribute("innerHTML")
            TDS.append(v)
    except Exception as e:
        print("Unable to get TDS: %s" % str(e))
    H=open("master-page.html","w")
    H.write(page)
    H.close()
else:
    H=open("master-page.html","r")
    page = H.read()
    H.close()

table = pd.read_html(page)

print(f'Total tables: {len(table)}')
df = table[0]
VALS=[]
for row in df.itertuples(index=True, name='Pandas'):
    print(row)
    d = []
    d.append(row[1])    
    d.append(row[2])    
    d.append(row[3])    
    d.append(row[4])
    d.append(row[5])
    d.append(row[6])
    d.append(row[6])
    VALS.append(d)

C = 0

OPTIONS={}
HAS_CLICKED=False
FOUND_LEADS=0
for x in VALS:
    if len(x) == 0:
        continue
    if len(x) != 7:
        print(x)
        print("LEN doesnt match, continuing")
        continue
    nhc_id = x[0]
    status = x[1]
    name = x[2]
    fname = name.split(" ")[0]
    lname = name.split(" ")[1]
    proc = x[3]
    city = x[4]
    state = x[5]
    date = x[6]
    email = ''
    phone = ''
    print("check if we already have it")
    o = db.query("select id from leads where nhc_id=%s",(x[0],))
    if len(o) > 0:
        if args.force:
            print("forcing delete for %s" % x[0])
            db.update("delete from leads_comments where leads_id=%s",(o[0]['id'],))
            db.update("delete from leads where id=%s",(o[0]['id'],))
            db.commit()
        else:
            continue
    print("loading details for %s" % nhc_id)
    content = ''
    if not os.path.exists("content-%s.html" % nhc_id):
        print("Going to id %s" % nhc_id)
        driver.get("https://www.newchoicehealth.com/Partners/InquiryDetails/%s" % nhc_id)
        time.sleep(5)
        driver.save_screenshot("%s/%s-%s-before.png" % (path,nhc_id,"details"))
        if len(OPTIONS) < 1:
            btn = driver.find_element(By.CLASS_NAME,"btn")
            btn.click()
            time.sleep(5)
        try:
            ed = driver.find_element(By.CLASS_NAME,'click-to-edit')
            ed.click()
            time.sleep(5)
        except:
            print("clicky wasnt there")
        driver.save_screenshot("%s/%s-%s-after.png" % (path,nhc_id,"details"))
        content = driver.page_source
        H=open("content-%s.html" % nhc_id,"w")
        H.write(content)
        H.close()
    else:
        H=open("content-%s.html" % nhc_id,"r")
        content=H.read()
        H.close()
    spl = content.split("<")
    filt = []
    cat = ''
    val = ''
    VALUES = {}
    PRICING = {}
    pcat = ''
    pval = ''
    for g in spl:
        if g.startswith('/'):
            continue
        print("===")
        print(g)
        if g.startswith('dt'):
            cat = g.split(">")
            cat = cat[1].replace(" ","")
            cat = cat.replace("\n","")
            print("category:[%s]" % cat)
        if g.startswith("span") and len(cat) > 0:
            val = g.split(">")
            if len(val) > 1:
                val = val[1]
            print("value=[%s]" % val)
        if g.startswith("option"):
            k = g.split('value=')
            k = k[1].split(">")
            k = k[0]
            y = g.split(">")
            y = y[1]
            y = y.lstrip().rstrip()
            print("option:: %s=%s" % (y,k))
            if y not in OPTIONS:
                OPTIONS[y] = k.replace("'",'').replace('"','')
        if 'Price' in g:
            pcat = g.split(">")
            pcat = pcat[1]
            print("pcat=%s" % pcat)
        if '$' in g and ',' in g and len(pcat) > 0:
            pval = g.split(">")
            pval = pval[1]
            print("pval=%s" % pval)
        if '$' in g and '$0' in g and len(pcat) > 0:
            pval = g.split(">")
            pval = pval[1]
            print("pval=%s" % pval)
        if len(pval) > 0 and len(pcat) > 0:    
            PRICING[pcat] = pval.replace("$","").replace(",","")
        if len(cat) > 0 and len(val) > 0:
            VALUES[cat] = val
            cat = ''
            val = ''
        #print("====")
        #print(g)
    print("PRICING=%s" % PRICING)
    if 'Expensive Price' not in PRICING:
        PRICING['Expensive Price'] = 0
    if 'Fair Price' not in PRICING:
        PRICING['Fair Price'] = 0
    if 'Great Price' not in PRICING:
        PRICING['Great Price'] = 0
    print("VALUES=%s" % VALUES)
    #print(OPTIONS)
    zipcode = ''
    sproc = ''
    if 'EmailAddress' in VALUES:
        email = VALUES['EmailAddress']
        email = email.lower()
    if 'Phone' in VALUES:
        phone = VALUES['Phone']
    if 'Zip' in VALUES:
        zipcode = VALUES['Zip']
    subprocname = ''
    procname = ''
    if ',' in proc:
        proc = proc.split(', ')
        subprocname = proc[1]
        procname = proc[0]
    else:
        procname = proc
    print("[%s]" % subprocname)
    print("[%s]" % procname)
    subproc_id = 0
    proc_id = 0
    s1 = db.query("select id from subprocedures where name=%s",(subprocname,))
    if len(s1) > 0:
        subproc_id = s1[0]['id']
    s2 = db.query("select id from procedures where name=%s",(procname,))
    if len(s2) > 0:
        proc_id = s2[0]['id']
    if len(s1) < 1 and len(s2) < 1:
        print("Couldnt find procedure: %s" % x)
        s1 = 1000 # Please select procedure stub
    print("proc=[%s]" % x[3])
    if x[3] in OPTIONS and s2 == 0:
        proc_id = int(OPTIONS[x[3]])
        print("new proc id=%s" % proc_id)
        s1 = 0

    b = db.query("""
        select id from leads_pricing where procedures_id=%s
        """,(proc_id,)
    )
    if len(b) < 1:
        db.update("""
            insert into leads_pricing (procedures_id,expensive,fair,great) values 
                (%s,%s,%s,%s)
            """,(proc_id,PRICING['Expensive Price'],PRICING['Fair Price'],
                 PRICING['Great Price'])
        )
    db.update("""
        insert into leads (
            nhc_id, procedures_id, subprocedures_id,
            first_name, last_name, zipcode,
            description,email,phone) values (
            %s,%s,%s,%s,%s,%s,%s,%s,%s
        )
        """,(nhc_id,proc_id,subproc_id,fname,lname,zipcode,x[3],email,phone)
    )
    insid = db.query("select LAST_INSERT_ID()")
    insid = insid[0]['LAST_INSERT_ID()']
    db.update("""
        insert into leads_pricing_history (procedures_id,leads_id,expensive,fair,great) values 
            (%s,%s,%s,%s,%s)
        """,(proc_id,insid,PRICING['Expensive Price'],PRICING['Fair Price'],
             PRICING['Great Price'])
    )
    db.commit()
    FOUND_LEADS += 1
    time.sleep(5)

if not args.usecache:
    H=open("./nhc-cache.json","w")
    H.write(json.dumps(TDS))
    H.close()

if FOUND_LEADS > 0:
    H=open("templates/leads/new_lead.html","r")
    M=H.read()
    H.close()
    url = config.getKey("host_url")
    email = config.getKey("leads_email")
    data = { 
        '__LINK__':"%s/#/login" % (url,),
        '__BASE__':url
    } 
    print("sending mail for leads discovered (%s)" % FOUND_LEADS)
    m = Mail()
    m.send(email,"%s New Leads discovered!" % FOUND_LEADS,"templates/leads/new_lead.html",data)




