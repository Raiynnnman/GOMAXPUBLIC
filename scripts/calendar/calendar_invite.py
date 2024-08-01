#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
from icalendar import Calendar, Event
import time
import json
import bs4
import pandas as pd
import requests

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import Mail
from util import getIDs
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--id', dest="id", action="store")
parser.add_argument('--resend', dest="resend", action="store_true")
args = parser.parse_args()
db = Query()


o = db.query("""
    select id,email,phone,description,day,time,timezone,offset
    from calendar_bookings
    where sent = 0
""")

m = Mail.Mail()
for x in o:
    print(x)
    subject = "POUND PAIN TECH Referral Introduction"

    sd = calcdate.sysParseDate(x['day'] + "T" + x['time'])
    ctz = x['offset']
    sd = sd + timedelta(minutes=x['offset'])
    print("sd = %s",sd)
    ed = calcdate.sysParseDate(x['day'] + "T" + x['time'])
    ed = ed + timedelta(minutes=x['offset']) + timedelta(minutes=15) # make duration configurable 
    print("ed = %s",ed)
    cal = Calendar()
    cal['dtstart'] = sd.strftime("%Y%m%dT%H%M")
    cal['dtend'] = ed.strftime("%Y%m%dT%H%M")
    cal['summary'] = "POUND PAIN TECH - Patient Referral Introduction"
    em = config.getKey("support_email")
    to = []
    cal.add('attendee',em)
    cal.add('attendee',x['email'])


    if not args.dryrun:
        m.sendMail(em,subject,'',attach=[{'t':'calendar','c':cal.to_ical().decode('utf-8')}],)
        # m.send(x['email'],subject,cal.to_ical().decode('utf-8'))
        #db.update("""
        #    update calendar_bookings set sent=1 where id=%s
        #    """,(x['id'],)
        #)

    db.commit()
