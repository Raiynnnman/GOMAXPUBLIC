# coding=utf-8

import sys
import os
import json
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))

from util import encryption,calcdate
from util.Logging import Logging
from util import S3Processing
from common import settings
from util.DBOps import Query
from util.UploadDocument import uploadDocumentOffice
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from processing import User
from util.Permissions import check_office
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class MyDayBase(SubmitDataRequest):

    def __init__(self):
        super().__init__()

class GetDayInformation(MyDayBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getUpcoming(self,off_id,db):
        upc = db.query("""
            select
               u.id,email,first_name,last_name,phone_prefix,phone,title,u.active,
               JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',ps.id,'time',ps.time,'day',ps.day
                    )
               ) as schedule
            from
                physician_schedule ps
                left join physician_schedule_scheduled pss on pss.physician_schedule_id=ps.id
                left join users u on u.id = pss.user_id
                left join office_user ou on ou.user_id = ps.user_id
            where
                ou.office_id = %s and 
                ps.id in (select physician_schedule_id from 
                    physician_schedule_scheduled) and
                ps.tstamp >  date_add(now(),interval 1 day)
            """,(off_id,)
        )
        ret = []
        for u in upc:
            if u['id'] is None:
                continue
            u['schedule'] = json.loads(u['schedule'])
            ret.append(u)
        return ret

    def getBundles(self,off_id,db):
        ret = []
        o = db.query("""
            select 
                b.id,
                b.name,
                json_arrayagg(
                    json_object(
                        'id',bi.id,'code',bi.code,
                        'assigned',bi.user_id,
                        'desc',bi.description,
                        'cpt_id',bi.icd_cpt_id,
                        'cpt',cpt.code,
                        'price', round(bi.price,2),
                        'client_price', round(bi.quantity*bi.price*b.markup*o.dhd_markup,2),
                        'quantity', bi.quantity
                    )
                ) as items
            from 
                bundle b,bundle_items bi,office o,icd_cpt cpt
            where 
                bi.icd_cpt_id = cpt.id and
                o.id = b.office_id and
                b.office_id=%s and
                bi.bundle_id = b.id
            group by
                b.id
            UNION
            select 
                b.id,
                b.name,
                json_arrayagg(
                    json_object(
                        'id',bi.id,'code',bi.code,
                        'assigned',bi.user_id,
                        'desc',bi.description,
                        'cpt_id',bi.icd_cpt_id,
                        'cpt',cpt.code,
                        'price', round(bi.price,2),
                        'client_price', round(bi.quantity*bi.price*b.markup*o.dhd_markup,2),
                        'quantity', bi.quantity
                    )
                ) as items
            from 
                bundle b,bundle_items bi,
                office o, icd_cpt cpt,
                office_associations oa
            where 
                bi.icd_cpt_id = cpt.id and
                o.id = b.office_id and
                b.office_id=oa.to_office_id and
                oa.from_office_id=%s and
                bi.bundle_id = b.id
            group by
                b.id
            """,(off_id,off_id)
        )
        for x in o:
            x['items'] = json.loads(x['items'])
            ret.append(x)
        return ret

    def getPhysicians(self,off_id,db):
        ret = db.query("""
            select 
                u.id,u.first_name,u.last_name,u.email,u.title,0 as dhd
            from
                office_user ou,
                users u
            where 
                ou.user_id = u.id and
                ou.office_id=%s
            UNION
            select 
                u.id,u.first_name,u.last_name,u.email,u.title,1 as dhd
            from users u 
            where id in 
            (select user_id 
                from user_entitlements ue,entitlements e 
                where ue.entitlements_id=e.id and e.name='Admin')
            """,(off_id,)
        )
        return ret

    def getPhyInfo(self,id,db):
        ret = db.query("""
            select 
                u.id,first_name,last_name,email,phone,title,a.name as status,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',ac.id,'text',ac.text,'created',ac.created,'user_id',ac.user_id
                    )
                ) as comments,a.name as status,a.id as status_id
            from 
                physician_schedule_scheduled pss
                left join physician_schedule ps on ps.id = pss.physician_schedule_id
                left join users u on u.id = ps.user_id
                left join appt_status a on a.id = pss.appt_status_id
                left outer join physician_appt_comments ac on ac.physician_schedule_scheduled_id = pss.physician_schedule_id
            where
                pss.physician_schedule_id = ps.id and 
                pss.appt_status_id = a.id and
                pss.user_id <> 1 and
                ps.user_id = u.id and 
                physician_schedule_id = %s
        """,(id,))
        return ret

    def getCustInfo(self,id,db):
        ret = db.query("""
            select 
               u.id,first_name,last_name,email,phone,title,
                JSON_OBJECT(
                    'id',s.id,'name',s.name
                ) as subprocedure,pss.id as schedule_id,
                a.name as status,a.id as status_id
            from 
                physician_schedule_scheduled pss,
                physician_schedule ps,
                appt_status a,
                users u,
                subprocedures s
            where
                pss.physician_schedule_id = ps.id and 
                pss.appt_status_id = a.id and
                pss.user_id <> 1 and
                pss.subprocedures_id = s.id and 
                pss.user_id = u.id and 
                physician_schedule_id = %s
        """,(id,))
        return ret

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
                        'phy_total', round(ii.phy_total,2),
                        'quantity', ii.quantity
                    )
                ) as items,
                i.office_id,i.patient_total
            from
                invoices i, invoice_items ii,
                stripe_invoice_status sis,
                bundle b,
                invoice_status ist
            where
                ii.invoices_id = i.id and
                b.id = i.bundle_id and
                sis.invoices_id = i.id and 
                ist.id = i.invoice_status_id and
                i.physician_schedule_id = %s
            """,(id,)
        )
        return inv

    @check_office
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
                        'id',ps.id,'time',ps.time,'day',ps.day
                    )
               ) as schedule
            from
                physician_schedule ps
                left join users u on u.id = ps.user_id
                left join office_user ou on ou.user_id = ps.user_id
            where
                ou.office_id = %s and 
                day = %s 
            """,(off_id,today)
        )
        if len(o) > 0 and o[0]['id'] is None:
            o = []
        ret = {'schedule':[],'config':{},'upcoming':[]}
        ret['upcoming'] = self.getUpcoming(off_id,db)
        ret['appt_status'] = db.query("""
            select id,name,user_assignable from appt_status 
            """
        )
        ret['bundles'] = self.getBundles(off_id,db)
        ret['physicians'] = self.getPhysicians(off_id,db)
        PHYS=[]
        for x in o:
            if x['id'] is None:
                continue
            newarr = x
            sched = json.loads(x['schedule'])
            newsched = []
            for j in sched:
                g = self.getPhyInfo(j['id'],db)
                g1 = self.getCustInfo(j['id'],db)
                j['icd_code'] = {}
                cm = db.query("""
                    select 
                        code,description,0 as is_pcs
                    from 
                        physician_schedule_scheduled pss,
                        icd_cm cm
                    where
                        pss.icd_cm_id = cm.id and
                        physician_schedule_id = %s
                    UNION
                    select 
                        code,description,1 as is_pcs
                    from 
                        physician_schedule_scheduled pss,
                        icd_pcs pcs
                    where
                        pss.icd_pcs_id = pcs.id and
                        physician_schedule_id = %s
                    """,(j['id'],j['id'])
                )
                if len(cm) > 0:
                    j['icd_code'] = cm[0]
                d = j
                if len(g) > 0 and len(g1) > 0:
                    phy = g[0]
                    phy['bundles'] = []
                    bund1 = db.query("""
                        select 
                            b.id,b.name,
                            json_arrayagg(
                                json_object(
                                    'id',bi.id,'code',bi.code,
                                    'assigned',bi.user_id,
                                    'desc',bi.description,
                                    'cpt_id',bi.icd_cpt_id,
                                    'cpt',cpt.code,
                                    'price', round(bi.price,2),
                                    'client_price', round(bi.quantity*bi.price*b.markup*o.dhd_markup,2),
                                    'quantity', bi.quantity
                                )
                            ) as items
                        from
                            bundle b, office o, bundle_items bi, appt_bundle ab, icd_cpt cpt
                        where 
                            b.office_id=o.id and 
                            bi.bundle_id = b.id and 
                            ab.bundle_id=b.id and
                            bi.icd_cpt_id = cpt.id and
                            ab.physician_schedule_scheduled_id = %s
                        group by 
                            b.id
                        """,(d['id'],)
                    )
                    for b1 in bund1:
                        if b1['id'] is None:
                            continue
                        b1['items'] = json.loads(b1['items'])
                        phy['bundles'].append(b1)
                    com = json.loads(phy['comments'])
                    phy['comments'] = []
                    for bb in com:
                        if bb['id'] is None:
                            continue
                        fin = bb
                        bb2 = encryption.decrypt(
                            fin['text'],
                            config.getKey('encryption_key')
                            )
                        fin['text'] = bb2
                        phy['comments'].append(fin)
                    cust = g1[0]
                    cust['subprocedure'] = json.loads(cust['subprocedure'])
                    md = User.UserConfig()
                    phy['documents'] = md.getDocuments(cust['id'])
                    inv = self.getInvoices(d['id'],db)
                    phy['invoices'] = {
                        'invoices':[],
                        'config': db.query("select id,name from invoice_status")
                    }
                    for ii in inv:
                        if ii['id'] is None:
                            continue
                        ii['items'] = json.loads(ii['items'])
                        phy['invoices']['invoices'].append(ii)
                        phy['invoices']['documents'] = db.query("""
                                select id,description 
                                from office_invoice_upload_documents 
                                where invoices_id=%s and office_id=%s
                                """,(ii['id'],ii['office_id'],))
                    d['appt'] = {
                        'physician':phy,
                        'customer': cust
                    }
                else:
                    d['appt'] = {}
                newsched.append(d)
            newarr['schedule'] = newsched
            ret['schedule'].append(newarr)
        for x in ret['schedule']:
            if x['id'] is None:
                continue
            PHYS.append({
                'id':x['id'],
                'title':x['title'],
                'first_name':x['first_name'],
                'last_name':x['last_name']
            })
        ret['phy'] = PHYS
        sched = db.query("""
            select psc.id,
                JSON_OBJECT('id',psc.id,'start_time',start_time,'end_time',end_time,
                    'inter',inter,'recurring',recurring,'days',days,'user_id',u.id,
                    'active',psc.active, 'first_name',u.first_name,
                    'last_name',u.last_name,'title',u.title
                ) as config from
            physician_schedule_config psc,
            office o, office_user ou,
            users u
            where 
                o.id = %s and
                ou.office_id=o.id and
                ou.user_id = psc.user_id and
                psc.user_id=u.id 
            """,(off_id,)
        )
        ret['config'] = []
        for x in sched:
            if x['id'] is None:
                continue
            j = json.loads(x['config'])
            j['days'] = json.loads(j['days'])
            ret['config'].append(j)
        return ret

class UpdateAppointment(MyDayBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def checkStatus(self,curstat,deststat):
        APPT = self.getAppointStatus()
        if deststat >= APPT['APPOINTMENT_STARTED']:
            if curstat < APPT['PAYMENT_SUCCESS']:
                return {
                    'success': False,
                    'message': "Payment not received yet"
                }
        return {
            'success': True
        }

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'id' not in params:
            raise Exception("ID_REQUIRED")
        appt_id = params['id']
        db = Query()
        o = db.query("""
            select appt_status_id from physician_schedule_scheduled
                where physician_schedule_id=%s
            """,(appt_id,)
        )
        curstat = o[0]['appt_status_id']
        msg = self.checkStatus(curstat,params['status'])
        if not msg['success']:
            log.info(msg)
            return msg
        if 'icd_cm_id' in params:
            cm = db.query("select id from icd_cm where code=%s",(params['icd_cm_id'],))
            if len(cm) > 0:
                db.update("""
                    update physician_schedule_scheduled set icd_cm_id=%s where physician_schedule_id=%s
                    """,(cm[0]['id'],appt_id)
                )
            else:
                cm = db.query("select id from icd_pcs where code=%s",(params['icd_cm_id'],))
                db.update("""
                    update physician_schedule_scheduled set icd_pcs_id=%s where physician_schedule_id=%s
                    """,(cm[0]['id'],appt_id)
                )
        if 'status' in params:
            db.update("""
                update physician_schedule_scheduled set updated=now(),
                    appt_status_id=%s where physician_schedule_id=%s
                """,(params['status'],appt_id)
            )
        if 'bundles' in params and len(params['bundles']) > 0:
            db.update("""
                delete from appt_bundle where 
                physician_schedule_scheduled_id = %s
                """,(appt_id,)
            )
            db.commit()
            for x in params['bundles']:
                if 'id' in x and x['id'] is None:
                    continue
                db.update("""
                    insert into appt_bundle (physician_schedule_scheduled_id,bundle_id)
                    values (%s,%s)
                    """,(appt_id,x['id'])
                )
            db.update("""
                update physician_schedule_scheduled ps set updated=now(),office_id=%s 
                    where ps.physician_schedule_id = %s
                """,(off_id,appt_id)
            )
        if 'comments' in params and len(params['comments']) > 0:
            for x in params['comments']:
                if 'id' in x and x['id'] is None:
                    continue
                if 'id' in x:
                    continue
                db.update("""
                    insert into physician_appt_comments(physician_schedule_scheduled_id,text,user_id) values
                        (%s,%s,%s)
                    """, (appt_id,
                          encryption.encrypt(x['text'],config.getKey('encryption_key')),
                          user['user_id'])
                )
        db.commit()
        return {'success': True}

class UpdateSchedule(MyDayBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        insid = 0
        if 'id' in params:
            db.update("""
                update physician_schedule_config set updated=now(),
                    user_id=%s, start_time=%s, end_time=%s,
                    inter=%s, recurring=%s, days=%s
                    where id=%s
                """, (
                    params['user_id'],params['start_time'],
                    params['end_time'],params['inter'],
                    params['recurring'],json.dumps(params['days']),
                    params['id']
                )
            )
            insid = params['id']
        else:
            db.update("""
                insert into physician_schedule_config(
                    user_id,start_time,end_time,inter,recurring,days) values
                    (%s,%s,%s,%s,%s,%s)
                    
                """,( 
                    params['user_id'],params['start_time'],
                    params['end_time'],params['inter'],
                    params['recurring'],json.dumps(params['days'])
                )
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
        db.update("""
            delete from physician_schedule ps where physician_schedule_config_id = %s and
                ps.id not in (select physician_schedule_id from physician_schedule_scheduled)
            """,(insid,)
        )
        db.commit()
        return {'success': True}

class ApproveInvoice(MyDayBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        INV = self.getInvoiceIDs()
        APT = self.getAppointStatus()
        o = db.query("""
            select invoice_status_id,physician_schedule_id from invoices where id=%s and office_id=%s
            """,(params['invoice_id'],off_id)
        )
        if len(o) < 1:
            raise Exception("INVOICE_NOT_FOUND")
        if o[0]['invoice_status_id'] >= INV['APPROVED']:
            ret = {
                'success': False,
                'message': 'Invoice is already approved'
            }
            return ret
        ps_id = o[0]['physician_schedule_id']
        db.update("""
            update invoices set updated=now(),invoice_status_id=%s where id=%s and office_id=%s
            """,(INV['APPROVED'],params['invoice_id'],off_id)
        )
        db.update("""
            update physician_schedule_scheduled set appt_status_id=%s where physician_schedule_id=%s
            """,(APT['INVOICE_APPROVED'],ps_id)
        )
        db.commit()
        return {'success': True}

class MyDayBillingDownloadDoc(MyDayBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
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
                office_invoice_upload_documents
            where
                office_id = %s and
                id = %s
            """,(off_id,params['id'])
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

class MyDayReceiptUpload(MyDayBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        bucket = config.getKey("document_bucket")
        aws_user = config.getKey("document_bucket_access_key")
        aws_pass = config.getKey("document_bucket_access_secret")
        if 'appt_id' not in params:
            return {'success': False, 'message':'UPLOAD_APPT_ID_REQUIRED'}
        if 'content' not in params:
            return {'success': False, 'message':'UPLOAD_CONTENT_REQUIRED'}
        db = Query()
        if 'content' in params:
            o = db.query("""
                select id from invoices where physician_schedule_id = %s and office_id=%s
                """,(params['appt_id'],off_id)
            )
            if len(o) < 1:
                return { 'success': False, 'message': 'INVOICE_NOT_FOUND_FOR_APPT'}
            invoice_id = o[0]['id']
            stat = uploadDocumentOffice(off_id,invoice_id,params['content'],'Receipt')
            db.update(""" update office_invoice_upload_documents set isreceipt = 1
                where id = %s""",(stat['insid'],)
            )
            db.commit()
        return {'success': True}


class GetOfficePatients(MyDayBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        query_office = """ 
        SELECT * FROM users WHERE id IN (SELECT user_id FROM physician_schedule_scheduled WHERE office_id = %s);
        """
        job, user, off_id, params = self.getArgs(*args, **kwargs)
        db = Query()
        if not off_id:
            return
        patients = db.query(query_office, (off_id,))
        return patients


class CustomAppointmentEmail(MyDayBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, data):
        ret = []
        params = data[0]
        if 'email' not in params:
            return
        email = params['email']
        url = config.getKey("host_url")
        data = {
            '__LINK__': "%s/#/login" % (url,),
            '__BASE__': url
        }
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % (url,)
        m = Mail()
        m.defer(email, "Appointment Scheduled with POUNDPAIN TECH",
                "templates/mail/appointment.html", data)
        return ret


class OfficeAppointmentEmail(MyDayBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, off):
        ret = []
        params = off[0]
        if 'office_email' not in params or params['office_email'] is None:
            return
        email = params['office_email']
        url = config.getKey("host_url")
        data = {
            '__LINK__': "%s/#/login" % (url,),
            '__BASE__': url
        }
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % (url,)
        m = Mail()
        m.defer(email, "Appointment Scheduled with POUNDPAIN TECH",
                "templates/mail/office-appointment.html", data)
        return ret


class SaveCustomAppointment(MyDayBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job, user, off_id, params = self.getArgs(*args, **kwargs)
        procedure_id = params['subprocedure']
        appt_id = params['appt_id']
        patient = params['patient']
        APPT_STATUS = self.getAppointStatus()
        o = db.query("""
                    select id from physician_schedule_scheduled where physician_schedule_id=%s
                """, (params['appt_id'],)
                     )
        if len(o) > 0:
            ret = {
                "success": False,
                "reason": "ALREADY_RESERVED"
            }
            return ret
        db.update("""
                    insert into physician_schedule_scheduled
                        (physician_schedule_id,appt_status_id,user_id,subprocedures_id) values (%s,%s,%s,%s)
                    """, (appt_id, APPT_STATUS['REGISTERED'], patient, procedure_id)
                  )
        db.commit()
        off = db.query("""
                    select
                        ou.office_id,office.email as office_email
                    from
                        physician_schedule ps
                        left join office_user ou on ou.user_id = ps.user_id
                        left join office on office.id = ou.office_id
                    where
                        ps.id = %s
                """, (appt_id,)
                )
        off_mail = OfficeAppointmentEmail()
        off_mail.execute(off)
        pat = db.query("""
                    select
                        id, email
                    from
                        users
                    where
                        id = %s
                """, (patient,)
                )
        cappt_mail = CustomAppointmentEmail()
        cappt_mail.execute(pat)
        ret = {
            "success": True
        }
        return ret
