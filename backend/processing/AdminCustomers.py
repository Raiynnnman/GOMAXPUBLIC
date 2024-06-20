# coding=utf-8

import sys
import os
import pyap
import json
import unittest
import traceback
import base64
import jwt
import pandas as pd
from io import StringIO
from nameparser import HumanName
import googlemaps

sys.path.append(os.path.realpath(os.curdir))

from util import encryption
from util import calcdate
from util import S3Processing
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Admin import AdminBase
from processing.OfficeReferrals import ReferrerUpdate
from processing.Audit import Audit
from processing import Search,Office
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin,check_bdr
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class CustomerUpdate(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        db.update("""
            update referral_users set name=%s,
                phone=%s,referrer_users_status_id=%s,
                email=%s where id=%s
            """,(
            params['name'],params['phone'],params['status_id'],
            params['email'],params['id']
            )
        )
        db.commit()
        return ret

class CustomerList(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        ENT = self.getEntitlementIDs()
        q = """
            select 
                u.id,u.email,u.name,u.phone,
                rus.name as status,
                rus.id as status_id,o.name as office_name,
                o.id as office_id,timestampdiff(minute,u.created,now()) as queue_time
            from 
                referrer_users u
                left join referrer_users_status rus on rus.id=u.referrer_users_status_id
                left outer join office o on u.office_id = o.id
            where 
                rus.id = u.referrer_users_status_id
            order by 
                u.updated desc
            """
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,))
        q += " limit %s offset %s " 
        o = db.query(q,(limit,offset*limit))
        ret['total'] = cnt[0]['cnt']
        ret['config'] = {}
        ret['config']['status'] = db.query("""
            select id,name from referrer_users_status
            """)
        ret['customers'] = []
        for x in o:
            ret['customers'].append(x)
        return ret
