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
               cfi.id,cfi.description,cfi.price,ct.created as transfer_date,
               JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',ciud.id,'description',ciud.description
                    )
               ) as documents
                
            from
                legal_fee_items cfi,
                legal_invoice_upload_documents ciud,
                legal_transfers ct
            where
                cfi.invoices_id = ciud.invoices_id and
                ct.invoices_id = cfi.invoices_id and 
                cfi.legal_user_id = %s
            """,(user['user_id'],)
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
                ifnull(t1.num1,0) as num1, /* cons revenue */
                ifnull(t2.num2,0) as num2, /* cons count */
                ifnull(t3.num3,0) as num3, /* appointments */
                ifnull(t4.num4,0) as num4  /* payouts */
            from 
                (select round(sum(price),2) as num1 from legal_fee_items a where legal_user_id = %s and
                    a.created > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                (select count(id) as num2 from legal_fee_items b where legal_user_id = %s and
                    b.created > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                (select count(css.id) as num3 from legal_schedule_scheduled css,legal_schedule cs where 
                    css.legal_schedule_id = cs.id and cs.user_id=%s and
                    cs.tstamp > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                (select count(cp.id) as num4 from legal_payouts cp,legal_transfers ct where cp.legal_transfers_id = ct.id and 
                    legal_user_id=%s and ct.created > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
            """,(user_id,user_id,user_id,user_id)
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
                ) as items,b.name as bundle_name,i.office_id
            from
                invoices i, invoice_items ii,
                stripe_invoice_status sis,
                bundle b,
                legal_schedule_scheduled css,
                invoice_status ist
            where
                css.legal_schedule_id = %s and
                ii.invoices_id = i.id and
                b.id = i.bundle_id and
                sis.invoices_id = i.id and 
                ist.id = i.invoice_status_id and
                i.physician_schedule_id = css.physician_schedule_id
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
        o = db.query(
            """
            select
               u.id,email,first_name,last_name,phone_prefix,phone,title,u.active,
               JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',cs.id,'time',cs.time,'day',cs.day
                    )
               ) as schedule
            from
                legal_schedule cs
                left join users u on u.id = cs.user_id
                left join office_user ou on ou.user_id = cs.user_id
            where
                cs.user_id = %s and 
                day = %s 
            """,(user['user_id'],today)
        )
        if len(o) > 0 and o[0]['id'] is None:
            o = []
        ret = {'schedule':[],'config':{},'upcoming':[]}
        s_conf = db.query("""
            select 
                csc.id,csc.start_time,csc.end_time,
                csc.inter,csc.recurring,csc.days,csc.active
            from
                legal_schedule_config csc,
                users u
            where 
                csc.user_id=u.id and
                csc.user_id=%s
        """,(user['user_id'],))
        ret['config']['schedule'] = []
        for s_c1 in s_conf:
            s_c1['days'] = json.loads(s_c1['days'])
            ret['config']['schedule'].append(s_c1)
        upc = db.query("""
            select
               u.id,email,first_name,last_name,phone_prefix,phone,title,u.active,
               JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',cs.id,'time',cs.time,'day',cs.day
                    )
               ) as schedule
            from
                legal_schedule cs
                left join users u on u.id = cs.user_id
                left join office_user ou on ou.user_id = cs.user_id
            where
                cs.user_id = %s and 
                cs.id in (select legal_schedule_id from 
                    legal_schedule_scheduled) and
                cs.tstamp >  date_add(now(),interval 1 day)
            limit 5
            """,(user['user_id'],)
        )
        for u in upc:
            if u['id'] is None:
                continue
            u['schedule'] = json.loads(u['schedule'])
            ret['upcoming'].append(u)
        ret['appt_status'] = db.query("""
            select id,name,user_assignable from appt_status 
            """
        )
        ret['physicians'] = self.getPhysicians(off_id,db)
        for x in o:
            if x['id'] is None:
                continue
            newarr = x
            sched = json.loads(x['schedule'])
            newsched = []
            for j in sched:
                j['appt'] = {
                    'customer':{},
                    'physician':{}
                }
                # get the physician
                phy = db.query("""
                    select
                        u.id,u.first_name,u.last_name,u.email,u.title,o.id,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id',oa.id,'addr1',oa.addr1,'addr2',oa.addr2,'phone',oa.phone,
                                'lat',oa.lat,'lon',oa.lon, 'city',oa.city,'state',
                                oa.state,'zipcode',oa.zipcode)
                        ) as addr
                    from
                        legal_schedule_scheduled css,
                        physician_schedule ps,
                        office_user ou,
                        office_addresses oa,
                        office o,
                        users u
                    where
                        css.physician_schedule_id=ps.id and
                        oa.office_id = o.id and
                        ps.user_id = u.id and
                        ou.office_id = o.id and
                        ou.user_id = u.id and
                        legal_schedule_id = %s;
                    """,(j['id'],)
                )
                if len(phy) > 0 and phy[0]['id'] is not None:
                    b = phy[0]
                    b['addr'] = json.loads(b['addr'])
                    j['appt']['physician'] = b
                c1 = db.query("""
                    select pa.id,pa.text,pa.created,pa.user_id from 
                    physician_appt_comments pa,legal_schedule_scheduled css
                    where 
                    pa.physician_schedule_scheduled_id = css.physician_schedule_id and
                    css.legal_schedule_id = %s
                    """,(j['id'],)
                )
                com = []
                for bb in c1:
                    if bb['id'] is None:
                        continue
                    fin = bb
                    bb2 = encryption.decrypt(
                        fin['text'],
                        config.getKey('encryption_key')
                        )
                    fin['text'] = bb2
                    com.append(fin)
                j['appt']['physician']['comments'] = com
                j['appt']['physician']['invoices'] = self.getInvoices(j['id'],db)
                cust = db.query("""
                    select 
                        u.id,u.first_name,u.last_name,u.email,u.title,u.phone,
                        JSON_OBJECT(
                            'id',s.id,'name',s.name
                        ) as subprocedure
                    from
                        legal_schedule_scheduled css,
                        legal_schedule cs,
                        physician_schedule_scheduled pss,
                        physician_schedule ps,
                        subprocedures s,
                        users u
                    where
                        cs.id = css.legal_schedule_id and 
                        pss.subprocedures_id = s.id and 
                        css.physician_schedule_id = pss.physician_schedule_id and
                        pss.physician_schedule_id = ps.id and
                        u.id = pss.user_id and
                        legal_schedule_id = %s
                    """,(j['id'],)
                )
                if len(cust) > 0 and cust[0]['id'] is not None:
                    j['appt']['customer'] = cust[0]
                    j['appt']['customer']['subprocedure'] = json.loads(j['appt']['customer']['subprocedure'])
                newsched.append(j)
            newarr['schedule'] = newsched
            ret['schedule'].append(newarr)
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

