# coding=utf-8

import sys
import os
import json
import unittest
import jwt
import base64
import mimetypes

from util import encryption,calcdate
from util import S3Processing
from processing import Stripe
from util.Logging import Logging
from util.Mail import Mail
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from processing.Profile import Profile
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_legal

log = Logging()
config = settings.config()
config.read("settings.cfg")

class ConsulantBase(SubmitDataRequest):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

class LegalBillingDownloadDoc(ConsulantBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_legal
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        bucket = config.getKey("document_bucket")
        aws_user = config.getKey("document_bucket_access_key")
        aws_pass = config.getKey("document_bucket_access_secret")
        o = db.query("""
            select 
                mimetype,blob_path 
            from
                legal_invoice_upload_documents
            where
                legal_user_id = %s and
                id = %s
            """,(user['user_id'],params['id'])
        )
        for x in o:
            blob_path = x['blob_path']
            content = S3Processing.downloadS3ItemFromBucket(
                aws_user,aws_pass,bucket,blob_path)
            b = encryption.decrypt(content.decode('utf-8'),config.getKey("encryption_key"))
            ret['content'] = b
            ret['filename'] = os.path.basename(blob_path)
            ret['filename'] = ret['filename'].replace('.enc','')
        return ret

class LegalBilling(ConsulantBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_legal
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        o = db.query("""
            select
                i.id,ist.name as invoice_status,i.physician_schedule_id,
                i.nextcheck,stripe_invoice_number as number,
                u.first_name,u.last_name,ps.day,ps.time,
                invoice_pdf_url, invoice_pay_url, amount_due, amount_paid,
                attempt_count, next_payment_attempt, status, finalized_at,
                paid_at, voided_at, marked_uncollectable_at, stripe_invoice_number,
                from_unixtime(due) as due,o.id as office_id,o.name as office_name,
                json_arrayagg(
                    json_object(
                        'id',ii.id,'code',ii.code,
                        'desc',ii.description,
                        'price', round(ii.price,2),
                        'quantity', ii.quantity
                    )
                ) as items
            from
                invoices i,
                invoice_items ii,
                users u,
                stripe_invoice_status sis,
                physician_schedule ps,
                physician_schedule_scheduled pss,
                office o,
                invoice_status ist
            where
                u.id = i.user_id and
                pss.physician_schedule_id = ps.id and
                i.physician_schedule_id = ps.id and
                i.id = ii.invoices_id and
                o.id = i.office_id and
                sis.invoices_id = i.id and 
                ist.id = i.invoice_status_id and
                i.office_id = %s
            group by
                i.id
            """,(off_id,)
        )
        for x in o:
            if x['id'] is None:
                continue
            x['documents'] = json.loads(x['documents'])
            ret.append(x)
        return ret

class LegalDashboard(ConsulantBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getRevenueThisMonth(self,user_id):
        db = Query()
        o = db.query("""
            select 
                0 as num1, /* cons revenue */
                0 as num2, /* cons count */
                0 as num3, /* appointments */
                0 as num4  /* payouts */
            """
        )
        return o[0]

    @check_legal
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        ret['revenue_month'] = self.getRevenueThisMonth(user['user_id'])
        return ret

class LegalConfig(ConsulantBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getInvoices(self,id,db):
        inv = db.query("""
            select
                i.id,from_unixtime(sis.due) as due,
                ist.name as invoice_status,i.updated,
                json_arrayagg(
                    json_object(
                        'id',ii.id,'code',ii.code,
                        'desc',ii.description,
                        'price', round(ii.price,2),
                        'quantity', ii.quantity
                    )
                ) as items,i.office_id
            from
                invoices i, invoice_items ii,
                stripe_invoice_status sis,
                legal_schedule_scheduled css,
                invoice_status ist
            where
                css.legal_schedule_id = %s and
                ii.invoices_id = i.id and
                sis.invoices_id = i.id and 
                ist.id = i.invoice_status_id and
                i.physician_schedule_id = css.physician_schedule_id
            group by
                i.id
            """,(id,)
        )
        ret = []
        for x in inv:
            if x['id'] is None:
                continue
            x['items'] = json.loads(x['items'])
            ret.append(x)
        return ret

    def getPhysicians(self,cons_id,db):
        ret = []
        ret = db.query("""
            select 
                u.id,u.first_name,u.last_name,u.email,u.title,0 as dhd
            from
                legal_schedule_scheduled css,
                users u,
                office_user ou,
                physician_schedule_scheduled pss
            where
                ou.user_id = pss.office_id and
                css.physician_schedule_id = pss.physician_schedule_id and
                css.legal_schedule_id= %s
            UNION
            select 
                u.id,u.first_name,u.last_name,u.email,u.title,1 as dhd
            from users u 
            where id in 
            (select user_id 
                from user_entitlements ue,entitlements e 
                where ue.entitlements_id=e.id and e.name='Admin')
            """,(cons_id,)
        )
        return ret

    @check_legal
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        # group_id = user['offices'][0]
        today = calcdate.getYearToday()
        if 'date' in params and len(params['date']) > 0:
            today = params['date']
        db = Query()
        ret = {'schedule':[],'config':{},'upcoming':[]}
        return ret

class UpdateSchedule(ConsulantBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_legal
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        insid = 0
        if 'id' in params:
            
            db.update("""
                update legal_schedule_config set updated=now(),
                    start_time=%s, end_time=%s,
                    inter=%s, recurring=%s, days=%s
                    where id=%s
                """, (
                    params['start_time'],
                    params['end_time'],params['inter'],
                    params['recurring'],json.dumps(params['days']),
                    params['id']
                )
            )
            insid = params['id']
        else:
            db.update("""
                insert into legal_schedule_config(
                    user_id,start_time,end_time,inter,recurring,days) values
                    (%s,%s,%s,%s,%s,%s)
                    
                """,( 
                    user['user_id'],params['start_time'],
                    params['end_time'],params['inter'],
                    params['recurring'],json.dumps(params['days'])
                )
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
        db.update("""
            delete from legal_schedule cs where legal_schedule_config_id = %s and
                cs.id not in (select legal_schedule_id from legal_schedule_scheduled)
            """,(insid,)
        )
        db.commit()
        return {'success': True}

