#!/usr/bin/python

import os
import sys
import json
from datetime import datetime,timedelta

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
import argparse
from util.DBOps import Query

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--user', dest="user", action="store")
args = parser.parse_args()

SCHED={}
db = Query()
arr = db.query("""
        select 
            user_id,start_time,end_time,recurring,
            inter,abbrev,offset,days,psc.id as sched_id
        from 
            consultant_schedule_config psc,
            users u,
            timezones t
        where
            psc.user_id = u.id and
            t.id=u.timezone_id
    """)

def doSchedule(today,x,sched):
    days = json.loads(x['days'])
    if today.weekday() not in days:
        # print("Skipping %s because %s its not in days" % (str(today),today.weekday()))
        return
    interval = x['inter']
    if interval < 1:
        print("Invalid interval %s for user %s" % (interval,x['user_id']))
        return
    user_id = x['user_id']
    start_time = datetime(today.year,today.month,today.day)
    s = x['start_time'].split(':')
    start_time = start_time + timedelta(hours=int(s[0]),minutes=int(s[1]))
    end_time = datetime(today.year,today.month,today.day)
    s = x['end_time'].split(':')
    end_time = end_time + timedelta(hours=int(s[0]),minutes=int(s[1]))
    thistime = start_time
    while thistime < end_time:
        (day,hour) = str(thistime).split(" ")
        hour = hour[:-3]
        thistime = thistime + timedelta(minutes=interval)
        s = '%s%s' % (day,hour)
        if s not in sched:
            # print("Adding %s @ %s for %s" % (day,hour,user_id))
            db.update("""
                insert into consultant_schedule(
                    user_id,day,time,tstamp,consultant_schedule_config_id) 
                values (%s,%s,%s,%s,%s)
            """,(user_id,day,hour,str(thistime),x['sched_id'])
            )
    db.commit()

def cleanUp():
    print("Cleaning up table")
    o = db.query("""
            select consultant_schedule_id from consultant_schedule_scheduled
    """)
    vals = []
    for x in o:
        vals.append(str(x['consultant_schedule_id']))
    q = "delete from consultant_schedule where id not in (%s) and tstamp < now()" % (','.join(vals))
    db.update(q)
    db.commit()

for x in arr:
    print("processing user %s" % x['user_id'])
    today = calcdate.getTimeIntervalAddSecondsRaw(None,int(x['offset'])*3600)
    C = 0
    o = db.query(""" 
        select id,day,time from consultant_schedule where user_id=%s 
    """, (x['user_id'],)
    )
    sched = {}
    for g in o:
        s = '%s%s' % (g['day'],g['time'])
        sched[s] = 1
    while C < 60:
        doSchedule(today,x,sched)
        today = today + timedelta(days=1)
        C += 1

cleanUp()
    
