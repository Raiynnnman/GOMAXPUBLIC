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

class InvoicesUpdate(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        if 'id' not in params or params['id'] is None:
            raise Exception('ID_REQUIRED')
        if 'comments' in params:
            for x in params['comments']:
                if 'id' in x:
                    continue
                bb2 = encryption.encrypt(
                    "%s: %s" % ("Invoice Comment",x['text']),
                    config.getKey('encryption_key')
                    )
                db.update("""
                    insert into invoices_comment (user_id,invoices_id,text)
                    values 
                    (%s,%s,%s)
                    """,(user['user_id'],params['id'],bb2)
                )
                db.update("""
                    insert into office_comment (user_id,office_id,text)
                    values 
                    (%s,%s,%s)
                    """,(user['user_id'],params['id'],bb2)
                )
                db.update("""
                    insert into invoice_history (invoices_id,user_id,text) values
                        (%s,%s,%s)""",(params['id'],user['id'],"ADDED_COMMENT")
                )
            db.commit()
        if 'invoice_status_id' in params:
            db.update("""
                update invoices set updated=now(),invoice_status_id=%s where id=%s
                """,(params['invoice_status_id'],params['id'])
             )
        db.commit()
        return ret

class InvoicesList(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        ret['config'] = {}
        ret['config']['status'] = db.query("select id,name from invoice_status")
        ret['invoices'] = []
        ret['sort'] = [
            {'id':1,'col':'updated','active':False,'direction':'asc'},
            {'id':2,'col':'name','active':False,'direction':'asc'}
        ]
        q = """
            select
                i.id,ist.name as invoice_status,i.physician_schedule_id,
                i.nextcheck,stripe_invoice_number as number,
                stripe_invoice_number, billing_period,
                from_unixtime(due) as due,bs.name as billing_system,
                o.id as office_id,o.name as office_name,o.email,
                u.first_name,u.last_name,u.phone,
                json_arrayagg(
                    json_object(
                        'id',ii.id,'code',ii.code,
                        'desc',ii.description,
                        'total',round(ii.quantity*ii.price,2),
                        'price', round(ii.price,2),
                        'quantity', ii.quantity
                    )
                ) as items,i.invoice_status_id,i.created,i.updated,
                round(sum(ii.price*quantity),2) as total
            from
                invoices i,
                invoice_items ii,
                billing_system bs,
                stripe_invoice_status sis,
                users u,
                office o,
                invoice_status ist
            where
                i.id = ii.invoices_id and
                i.billing_system_id = bs.id and
                o.user_id = u.id and
                month(billing_period) <= month(now()) and
                year(billing_period) <= year(now()) and
                o.id = i.office_id and
                sis.invoices_id = i.id and 
                ist.id = i.invoice_status_id 
            """
        if 'status' in params:
            q += " and ("
            arr = []
            for z in params['status']:
                arr.append("invoice_status_id = %s " % z)
            q += " or ".join(arr)
            q += ")"
        count_par = []
        search_par = [
            int(limit),
            int(offset)*int(limit)
        ]
        if 'search' in params and params['search'] is not None:
            q += """ and (o.email like %s  or o.name like %s ) 
            """
            search_par.insert(0,params['search']+'%%')
            search_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
        q += " group by i.id "
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,),count_par)
        ret['total'] = cnt[0]['cnt']
        if 'sort' not in params or params['sort'] == None:
            q += """
                order by
                    updated desc
            """
            ret['sort'][0]['active'] = True
            ret['sort'][0]['direction'] = 'desc'
        else:
            h = params['sort']
            v = 'updated'
            d = 'desc'
            if 'direction' not in params:
                params['direction'] = 'asc'
            for x in ret['sort']:
                if x['id'] == h:
                    v = x['col']
                    d = params['direction']
                    x['active'] = True
                    x['direction'] = params['direction']
            q += """
                order by %s %s
            """ % (v,d)
        q += " limit %s offset %s " 
        o = db.query(q,search_par)
        for x in o:
            x['items'] = json.loads(x['items'])
            x['stripe'] = db.query("""
                select
                    invoice_pdf_url, invoice_pay_url, amount_due/100 as amount_due, 
                    amount_paid/100 as amount_paid,
                    attempt_count, next_payment_attempt, status, from_unixtime(finalized_at) as finalized_at,
                    from_unixtime(paid_at) as paid_at, from_unixtime(voided_at) as voided_at, 
                    from_unixtime(marked_uncollectable_at) as marked_uncollectable_at, 
                    stripe_fee, updated, stripe_invoice_id
                from stripe_invoice_status sis
                where invoices_id=%s
                """,(x['id'],)
            )
            if len(x['stripe']) > 0:
                x['stripe'] = x['stripe'][0]
            x['comments'] = []
            comms = db.query("""
                select 
                    ic.id,ic.text,ic.user_id,
                    u.first_name,u.last_name,u.title,
                    ic.created
                from 
                invoices_comment ic, users u
                where ic.user_id = u.id and invoices_id=%s
                order by ic.created desc
                """,(x['id'],)
            )
            x['last_comment'] = ''
            x['assignee'] = db.query("""
                    select
                        u.id,u.first_name,u.last_name
                    from
                        office_user ou, users u
                    where
                        ou.user_id=u.id
                        and office_id=%s
                    UNION
                    select
                        u.id,u.first_name,u.last_name
                    from users u
                    where id in
                    (select user_id
                        from user_entitlements ue,entitlements e
                        where ue.entitlements_id=e.id and e.name='Admin')
                    """,(x['office_id'],)
            )
            for cc in comms: 
                # This happens when we switch environments, just skip
                try:
                    bb2 = encryption.decrypt(
                        cc['text'],
                        config.getKey('encryption_key')
                        )
                    cc['text'] = bb2
                    x['comments'].append(cc)
                    x['last_comment'] = bb2
                except:
                    pass
            x['history'] = db.query("""
                select 
                    uh.id,uh.text,uh.user_id,uh.created,
                    u.first_name,u.last_name,u.title
                from 
                    invoice_history uh, users u 
                where 
                    uh.user_id = u.id and invoices_id=%s
                order by created desc
                """,(x['id'],)
            )
            ret['invoices'].append(x)
        ret['success'] = True
        return ret
