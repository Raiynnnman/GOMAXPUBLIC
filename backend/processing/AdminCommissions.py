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
from processing.Audit import Audit
from processing import Search,Office
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin,check_bdr
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class CommissionUserList(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_bdr
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
        ret['config']['period'] = db.query("""
            select count(i.id) as count,
                i.billing_period as value,
                date_format(i.billing_period,'%b, %Y') as label from 
                commission_users cu, invoices i
            where cu.invoices_id = i.id
            order by
                i.billing_period desc
        """)
        q1 = """
            select 
                u.id,concat(u.first_name,' ',u.last_name) as name,
                amount,
                cus.created,
                i.billing_period,
                o.id as office_id,o.name as office_name
            from 
                office o,
                invoices i,
                users u,
                commission_users cus
            where 
                i.office_id = o.id and
                i.id = cus.invoices_id and
                cus.user_id = u.id and
                cus.office_id = o.id and
                u.id = cus.user_id
        """
        q2 = """
            select 
                u.id,concat(u.first_name,' ',u.last_name) as name,
                amount,
                cus.created,
                i.billing_period,
                o.id as office_id,o.name as office_name
            from 
                office o,
                invoices i,
                users u,
                commission_bdr_users cus
            where 
                i.office_id = o.id and
                i.id = cus.invoices_id and
                cus.user_id = u.id and
                cus.office_id = o.id and
                u.id = cus.user_id
        """
        p = []
        if 'CommissionsAdmin' not in user['entitlements']:
            q1 += ' and cus.user_id = %s ' % user['id']
            q2 += ' and cus.user_id = %s ' % user['id']
        if 'period' in params and params['period'] is not None:
            v = ''
            v += ' and ( ' 
            a = []
            for x in params['period']:
                a.append("""
                    (
                        month(%s) = month(i.billing_period) and
                        year(%s) = year(i.billing_period)
                    )
                """)
                p.append(x)
                p.append(x)
                p.append(x)
                p.append(x)
            v += " or ".join(a)
            v += ")"
            q1 += v
            q2 += v
        q = q1 + " UNION ALL " + q2
        cnt = db.query("select count(id) as cnt from (" + q + ") as t",p)
        ret['total'] = cnt[0]['cnt']
        if 'report' not in params or params['report'] is None:
            q +=  " limit %s offset %s " 
            p.append(limit)
            p.append(offset*limit)
        o = db.query(q,p)
        if 'report' in params and params['report'] is not None:
            ret['filename'] = 'commission_report.csv'
            frame = pd.DataFrame.from_dict(o)
            t = frame.to_csv()
            ret['content'] = base64.b64encode(t.encode('utf-8')).decode('utf-8')
        ret['commissions'] = o
        return ret

class CommissionList(AdminBase):
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
        ret['config']['period'] = db.query("""
            select count(cu.id) as count,
                date(cu.created) as value,
                date_format(cu.created,'%b, %Y') as label from 
                commission_users cu
            group by
                date_format(cu.created,'%b, %Y')
            order by
                date_format(cu.created,'%b, %Y') desc
        """)
        q1 = """
            select 
                cus.id,concat(u.first_name,' ',u.last_name) as name,
                amount,
                cus.created,
                i.id as invoice_id,
                i.billing_period,
                o.id as office_id,o.name as office_name
            from 
                office o,
                invoices i,
                users u,
                commission_users cus
            where 
                i.office_id = o.id and
                i.id = cus.invoices_id and
                cus.user_id = u.id and
                cus.office_id = o.id and
                u.id = cus.user_id
        """
        q2 = """
            select 
                cus.id,concat(u.first_name,' ',u.last_name) as name,
                amount,
                cus.created,
                i.id as invoice_id,
                i.billing_period,
                o.id as office_id,o.name as office_name
            from 
                office o,
                invoices i,
                users u,
                commission_bdr_users cus
            where 
                i.office_id = o.id and
                i.id = cus.invoices_id and
                cus.user_id = u.id and
                cus.office_id = o.id and
                u.id = cus.user_id
        """
        p = []
        if 'CommissionsAdmin' not in user['entitlements']:
            q1 += ' and cus.user_id = %s ' % user['id']
            q2 += ' and cus.user_id = %s ' % user['id']
        if 'period' in params and params['period'] is not None:
            v = ''
            v += ' and ( ' 
            a = []
            for x in params['period']:
                a.append("""
                    (
                        month(%s) = month(i.billing_period) and
                        year(%s) = year(i.billing_period)
                    )
                """)
                p.append(x)
                p.append(x)
                # p.append(x)
                # p.append(x)
            v += " or ".join(a)
            v += ")"
            q1 += v
            q2 += v
        q = q1 # + " UNION ALL " + q2
        cnt = db.query("select count(id) as cnt from (" + q + ") as t",p)
        q += " order by cus.updated desc "
        ret['total'] = cnt[0]['cnt']
        if 'report' not in params or params['report'] is None:
            q +=  " limit %s offset %s " 
            p.append(limit)
            p.append(offset*limit)
        o = db.query(q,p)
        if 'report' in params and params['report'] is not None:
            ret['filename'] = 'commission_report.csv'
            frame = pd.DataFrame.from_dict(o)
            t = frame.to_csv()
            print(t)
            ret['content'] = base64.b64encode(t.encode('utf-8')).decode('utf-8')
        ret['commissions'] = o
        return ret

