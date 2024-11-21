#!/usr/bin/python

import os
import random
import traceback
from nameparser import HumanName
import sys
import traceback
from datetime import datetime, timedelta
import time
import json
from nameparser import HumanName

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs
from salesforce import sf_util

import argparse
from salesmate import sm_util
from salesmate.sm_util import SM_Contacts,SM_Companies,SM_Deals

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--debug', dest="debug", action="store_true")
parser.add_argument('--limit', dest="limit", action="store")
args = parser.parse_args()

PQ = getIDs.getProviderQueueStatus()
ST = getIDs.getLeadStrength()
OT = getIDs.getOfficeTypes()
CS = getIDs.getCallStatus()
ALT = getIDs.getAltStatus()
BS = getIDs.getBillingSystem()
ENT = getIDs.getEntitlementIDs()

debug = args.debug

db = Query()

H=open("sm_activity.json","r")
js=H.read()
activity=json.loads(js)
H.close()

H=open("sm_users.json","r")
js=H.read()
users=json.loads(js)
H.close()

ACT_STAT = getIDs.getActionStatus()
ACT_TYPE = getIDs.getActionType()

CNTR = 0
for x in activity:
    j = activity[x]
    tid = j['id']
    sm_uid = j['owner']['id']
    start = j['createdAt']
    due = j['dueDate']
    endDate = j['endDate']
    duration = j['duration']
    o = db.query("""
        select from_unixtime(%s) as c,from_unixtime(%s) as d, from_unixtime(%s) as e
        """,(start,due,endDate)
    )
    start = o[0]['c']
    due = o[0]['d']
    endDate = o[0]['e']
    completed = j['isCompleted']
    mytype = j['type']
    title = j['title']
    if title is None:
        title = ''
    print("----")
    print(json.dumps(j,indent=4))
    comp = str(j['primaryCompany']['id'])
    o = db.query("""
        select pq.id from office o, provider_queue pq where pq.office_id=o.id and o.sm_id = %s
        """,(comp,)
    )
    if len(o) < 1:
        print("ERROR: Couldnt find pqid for task %s" % tid)
        continue
    pq_id = o[0]['id']
    o = db.query("""
        select id from provider_queue_actions where sm_id = %s
        """,(tid,)
    )
    if len(o) > 0:
        print("SKIP: Already have %s" % tid)
        continue
    o = db.query("""
        select id from users where sm_id = %s
        """,(tid,)
    )
    if len(o) < 1:
        print("ERROR: Couldnt find user %s" % tid)
        continue
    uid = o[0]['id']
    act_id = ACT_TYPE['Task']
    stat_id = ACT_STAT['Scheduled']
    if completed:
        stat_id = ACT_STAT['Completed']
    if 'call' in title.lower():
        act_id = ACT_TYPE['Call']
    if 'intro' in title.lower():
        act_id = ACT_TYPE['Call']
    if 'f/u' in title.lower():
        act_id = ACT_TYPE['Call']
    if 'demo' in title.lower():
        act_id = ACT_TYPE['Call']
    if 'email' in title.lower():
        act_id = ACT_TYPE['Email']
    if type == 'Call':
        act_id = ACT_TYPE['Call']
    if type == 'Task':
        act_id = ACT_TYPE['Task']
    if type == 'Meeting':
        act_id = ACT_TYPE['Appointment']
    bb2 = encryption.encrypt(
        title,
        config.getKey('encryption_key')
        )
    db.update("""
        insert into provider_queue_actions (
            provider_queue_id,user_id,action,start_date,
            end_date,due_date,duration,sm_id,
            provider_queue_actions_type_id,
            provider_queue_actions_status_id
        ) values (
            %s,%s,%s,%s,
            %s,%s,%s,%s,
            %s,%s
        )
        """,(
        pq_id,uid,bb2,start,endDate,due,duration,
        tid,act_id,stat_id
        )
    )
    db.commit()
    

