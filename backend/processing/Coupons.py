# coding=utf-8

import sys
import os
import json
import unittest
import traceback
import base64
import jwt
import pandas as pd
from io import StringIO

sys.path.append(os.path.realpath(os.curdir))

from processing.Admin import AdminBase
from util import encryption
from util import calcdate
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from processing import Search,Office
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class CouponList(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10000
        OT = self.getOfficeTypes()
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        ENT = self.getEntitlementIDs()
        ret['config'] = {}
        q = """
            select 
                c.id,c.name,c.pricing_data_id,c.total,c.perc,
                c.reduction,c.start_date,c.end_date,c.active
            from 
                coupons c
                left join pricing_data p on p.id = c.pricing_data_id
        """
        p = []
        cnt = db.query("select count(id) as cnt from (" + q + ") as t",p)
        ret['total'] = cnt[0]['cnt']
        o = db.query(q,p)
        ret['coupons'] = o
        return ret

class CouponSave(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        insid = 0
        OT = self.getOfficeTypes()
        if 'id' in params and params['id'] is not None:
            db.update("""
                update coupons set 
                    active=%s,
                    end_date=%s,
                    start_date=%s,
                    total=%s,
                    reduction=%s,
                    perc=%s,
                    name=%s,
                    pricing_data_id=%s
                where id = %s
                """,(
                    params['active'],
                    params['end_date'],
                    params['start_date'],
                    params['total'],
                    params['reduction'],
                    params['perc'],
                    params['name'],
                    params['pricing_data_id'],
                    params['id']
                    )
            )
        else:
            db.update("""
                insert coupons (active,end_date,start_date,total,reduction,perc,name,pricing_data_id)
                values (%s,%s,%s,%s,%s,%s,%s,%s)
                """,(
                    params['active'],
                    params['end_date'],
                    params['start_date'],
                    params['total'],
                    params['reduction'],
                    params['perc'],
                    params['name'],
                    params['pricing_data_id']
                    )
            )
        db.commit()
        return {'success':True}
