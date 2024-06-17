#!/usr/bin/python

import os
import sys
import base64
import time
import json
import pandas as pd
import googlemaps
from datetime import datetime

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate,getIDs,Mail
import argparse
import requests
from util.DBOps import Query
from util.Mail import Mail


config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
parser.add_argument('--id', dest="id", action="store")
args = parser.parse_args()

db = Query()

REF = getIDs.getReferrerUserStatus()

q = """
    select
        id,email,name,phone,office_id,
        zipcode,error_mail_sent,accept_mail_sent,
        referrer_id,user_id,zipcode,lat,lon
    from
        referrer_users r
    where
        referrer_users_status_id < %s
    """
    
if args.id is not None:
    q+= "and r.id = %s" % args.id

o = db.query(q,(REF['ACCEPTED'],))

m = Mail()
for r in o:
    print(r)
    cqueue = db.query("""
        select 
            ruq.referrer_users_status_id,
            TIMESTAMPDIFF(minute,ru.created,now()) as time
        from 
            referrer_users_queue ruq,
            referrer_users ru
        where
            ruq.referrer_users_id = %s and
            ruq.referrer_users_id = ru.id and
            ru.referrer_users_status_id < %s and
            TIMESTAMPDIFF(minute,ru.created,now()) > 5
        """,(r['id'],REF['ACCEPTED'])
    )

    NO_ACCEPT = False
    for stat in cqueue:
        print(stat)
    
    if False and not x['error_mail_sent']:
        sysemail = config.getKey("support_email")
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/app/main/admin/customers/%s" % (url,x['id']),
            '__BASE__':url
        } 
        data['__USER_NAME__'] = x['name']
        data['__ZIPCODE__'] = x['zipcode']
        data['__OFFICE_URL__'] = "%s/app/main/admin/customers/%s" % (url,x['id'])
        m.send(sysemail,"No locations accepted customer referral","templates/mail/no-locations-referrer.html",data)
        db.update("""
            update referrer_users set error_mail_sent = 1 where id = %s
            """,(x['id'],)
        )
