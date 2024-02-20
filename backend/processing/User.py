# coding=utf-8

import sys
import os
import json
import unittest
import jwt
import base64
import mimetypes
import dateutil 

from util import encryption,calcdate
from util import S3Processing
from util.UploadDocument import uploadDocument
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

log = Logging()
config = settings.config()
config.read("settings.cfg")

class UserBase(SubmitDataRequest):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getUserLonLat(self,user_id):
        db = Query()
        lat = 0
        lon = 0
        o = db.query(""" 
            select zipcode from users u,user_addresses ua
            where user_id=%s""",(user_id,)
        )
        if len(o) < 1:
            return lon,lat
        d = db.query("""
            select lon,lat
            from position_zip 
            where 
                zipcode = %s
            limit 1
            """,(o[0]['zipcode'],)
        )
        if len(o) < 1:
            return lon,lat
        lon = d[0]['lon']
        lat = d[0]['lat']
        return lon,lat
        

class UserConfig(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getBundles(self,user_id):
        db = Query()
        o = db.query("""
                select 
                    u.first_name,u.last_name,u.title,u.id as phy_id,ps.id as appt_id,
                    b.id as bundle_id,b.name as bundle_name,s.name as subname,s.id as sub_id
                from 
                    appt_bundle ab,bundle b,
                    physician_schedule ps,physician_schedule_scheduled pss,
                    users u,subprocedures s
                where 
                    ab.physician_schedule_scheduled_id = pss.physician_schedule_id and
                    pss.subprocedures_id=s.id and 
                    ab.bundle_id=b.id and
                    pss.user_id=%s and
                    ps.user_id=u.id and
                    ps.id = pss.physician_schedule_id
            """,(user_id,))
        ret = []
        for x in o:
            j = db.query("""
                select 
                    round(sum(bi.price),2) as total,
                    json_arrayagg(
                        json_object(
                            'id',bi.id,'code',bi.code,
                            'assigned',bi.user_id,
                            'desc',bi.description,
                            'price', round(bi.price,2),
                            'quantity', bi.quantity
                        )
                    ) as items
                from bundle_items bi where bundle_id=%s
                """,(x['bundle_id'],)
            )
            j = j[0]
            x['items'] = json.loads(j['items'])
            x['total'] = j['total']
            ret.append(x)
        return ret

    def getAppointments(self,user_id,lat,lon,future):
        ret = []
        db = Query()
        q = """
            select
                o.id as office_id,o.name,pss.id as appt_id,u.first_name,u.last_name,u.title,
                pm.headshot,pm.video,u.id as phy_id,s.name as subproc,p.name as proc,a.name as status,
                round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) as miles,
                ps.id as schedule_id, pss.created as created
            from
                physician_schedule_scheduled pss,physician_schedule ps,
                users u,office o,office_user ou,office_addresses oa,
                physician_media pm,procedures p,subprocedures s,
                appt_status as a
            where
                pss.physician_schedule_id = ps.id and
                s.procedures_id = p.id and
                a.id=pss.appt_status_id and 
                pss.subprocedures_id = s.id and 
                pm.user_id = u.id and
                ou.office_id = o.id and 
                oa.office_id = o.id and 
                ou.user_id = u.id and 
                u.id = ps.user_id and 
                pss.user_id=%s
            """
        if future:
            q += " and ps.tstamp > now() "
        o = db.query(q,(lon,lat,user_id))
        for x in o:
            q = db.query("""
                select 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',oa.id,'addr1',oa.addr1,'addr2',oa.addr2,'phone',oa.phone,
                        'lat',oa.lat,'lon',oa.lon, 'city',oa.city,'state',
                        oa.state,'zipcode',oa.zipcode)
                ) as addr
                from office_addresses oa
                where oa.office_id=%s""" % (x['office_id'],))
            x['addr'] = []
            x['rating'] = db.query(
                "select ifnull(round(avg(rating),2),0) as avg from ratings where user_id=%s",(x['phy_id'],)
            )
            x['documents_authorized'] = False
            x['documents_email'] = db.query(
                "select email from user_upload_email where office_id=%s and user_id=%s", 
                    (x['office_id'],user_id)
            )
            if len(x['documents_email']) > 0:
                x['documents_email'] = x['documents_email'][0]
                x['documents_email'] = x['documents_email']['email']
            else:
                x['documents_email'] = ''
            x['schedule'] = db.query(
                """
                    select ps.id,ps.day,ps.time 
                    from 
                        physician_schedule ps
                        join physician_schedule_scheduled pss on pss.physician_schedule_id = ps.id
                    where 
                        ps.id=%s and 
                        active = 1 and
                        pss.id is not null
                    order by 
                        tstamp
                """,(x['schedule_id'],)
            )
            x['about'] = db.query(
                "select text from physician_about where user_id=%s",(x['phy_id'],)
            )
            if len(x['about']) > 0:
                x['about'] = x['about'][0]['text']
            else:
                x['about'] = ''
            if len(x['rating']) > 0:
                x['rating'] = x['rating'][0]['avg']
            else:
                x['rating'] = 0
            for g in q:
                x['addr'].append(json.loads(g['addr']))
            ret.append(x)
        return ret

    def getAddresses(self,user_id):
        db = Query()
        o = db.query("""
            select 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',ua.id,'addr1',addr1,'addr2',addr2,'phone',phone,
                        'city',city,'state',state,'zipcode',zipcode)
                ) as addr
            from user_addresses ua where user_id = %s
            """,(user_id,)
        )
        ret = []
        for x in o:
            if x['addr'] is None:
                continue
            x['addr'] = json.loads(x['addr'])
            ret.append(x)
        return ret

    def getDocuments(self,user_id):
        db = Query()
        o = db.query("""
            select 
                uue.id,u.id as user_id,u.first_name,u.last_name,o.name,o.id as office_id,uue.email,
                json_arrayagg(
                    json_object(
                        'id',uud.id
                    )
                ) as documents
            from 
                user_upload_email uue
                left join users u on u.id = uue.user_id
                left join office o on o.id = uue.office_id
                left outer join user_upload_documents uud on uud.user_upload_email_id = uue.id
            where
                user_id = %s
            group by 
                uue.id
                
            """,(user_id,))
        ret = []
        for x in o:
            i = json.loads(x['documents'])
            if len(i) > 0 and i[0]['id'] is None:
                i = []
            x['documents'] = i
            ret.append(x)
        return ret 

    def getCards(self,user_id):
        ret = []
        db = Query()
        o = db.query("""
            select 
                id,card_id,last4,exp_month,exp_year,
                is_active,is_default
            from user_cards where user_id=%s
            """,(user_id,)
        )
        return o

    def getInvoices(self,user_id,unpaid):
        ret = []
        db = Query()
        INV = self.getInvoiceIDs()
        q = """
            select
                i.id,ist.name as invoice_status,i.physician_schedule_id,
                i.bundle_id,stripe_invoice_number as number,from_unixtime(sis.due) as due,
                u.title,u.first_name,u.last_name,ps.day,ps.time,s.name as subprocedure_name,
                o.id as office_id,o.name as office_name,
                json_arrayagg(
                    json_object(
                        'id',ii.id,'code',ii.code,
                        'desc',ii.description,
                        'price', round(ii.price,2),
                        'quantity', ii.quantity
                    )
                ) as items,sis.invoice_pay_url,sis.invoice_pdf_url
            from
                invoices i,
                invoice_items ii,
                users u,
                stripe_invoice_status sis,
                physician_schedule ps,
                physician_schedule_scheduled pss,
                subprocedures s,
                office o,
                invoice_status ist
            where
                u.id = ps.user_id and
                pss.physician_schedule_id = ps.id and
                pss.subprocedures_id = s.id and
                i.physician_schedule_id = ps.id and
                i.id = ii.invoices_id and
                o.id = i.office_id and
                sis.invoices_id = i.id and 
                ist.id = i.invoice_status_id and
                i.invoice_status_id >= %s and
                i.user_id=%s 
            """
        if unpaid:
            q += " and ist.name = 'SENT' "
        q += " group by i.id "
        o = db.query(q,(INV['SENT'],user_id))
        ret = []
        for x in o:
            if x['id'] is None:
                continue
            x['items'] = json.loads(x['items'])
            ret.append(x)
        return ret

    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        lat = lon = 0
        if 'location' not in params:
            lon,lat = self.getUserLonLat(user['user_id'])
        else:
            lat = params['location']['lat']
            lon = params['location']['lon']
        future = False
        if 'future' in params and params['future']:
            future = True
        ret['appt'] = self.getAppointments(user['user_id'],lat,lon,future)
        ret['bundle'] = self.getBundles(user['user_id'])
        ret['documents'] = self.getDocuments(user['user_id'])
        ret['cards'] = self.getCards(user['user_id'])
        ret['invoices'] = self.getInvoices(user['user_id'],False)
        ret['address'] = self.getAddresses(user['user_id'])
        return ret


class UserDocumentsUpdate(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def consentForm(self,db,params,off_id,user_id):
        q = db.query("""
            select id from user_consent_documents where office_id=%s
                and user_id=%s
            """,(off_id,user_id)
        )
        if len(q) > 0:
            return { 'success':False, 'message': 'CONSENT_ALREADY_EXISTS'}
        fields = [
            'authorized', 'user_patient_name', 'user_dob', 'user_ssn', 
            'authorization_all_medical', 'authorization_only_related', 
            'authorization_medical_condition', 'authorization_medical_date', 
            'authorization_medical_date_start', 'authorization_medical_date_end', 
            'authorization_other', 'authorization_other_value', 
            'disclosure_any_authorized_party', 'disclosure_only_authorized_party', 
            'disclosure_only_authorized_value', 'disclosure_only_authorized_name', 
            'disclosure_only_authorized_address', 'disclosure_only_authorized_phone', 
            'disclosure_only_authorized_fax', 'disclosure_only_authorized_email', 'purpose_general_purpose', 
            'purpose_to_receive_payment', 'purpose_to_sell_medical', 'purpose_other', 
            'purpose_other_value', 'termination_written_rev', 'termination_on_date', 
            'termination_on_date_value', 'termination_other', 'termination_other_value', 
            'acknowledge_signature', 'acknowledge_date', 
            'patient_unable_minor', 'patient_unable_age', 'patient_unable_incapacitated', 
            'patient_unable_incapacitated_condition', 'patient_unable_incapacitated_condition_value', 
            'patient_unable_incapacitated_other', 'patient_unable_incapacitated_other_value', 
            'patient_unable_signature', 'patient_unable_date', 'patient_unable_relation', 
            'sensitive_consent', 'sensitive_do_not_consent', 
            'sensitive_signature_patient', 'sensitive_signature_patient_date'
        ]
        FIELDS = []
        VALUES = []
        SUBS = []
        for x in fields:
            if x in params:
                
                FIELDS.append(x)
                VALUES.append(params[x])
                SUBS.append("%s")
        
        q = "insert into user_consent_documents (user_id,office_id,"
        q += ",".join(FIELDS) + ")"
        q += " values (%s,%s," + ",".join(SUBS) + ")"
        if len(FIELDS) < 1:
            return { 'success':False, 'message': 'FORM_EMPTY'}
        VALUES.insert(0,off_id)
        VALUES.insert(0,user_id)
        db.update(q,VALUES);
        return { 'success':True }
        

    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        bucket = config.getKey('document_bucket')
        buser = config.getKey('document_bucket_access_key')
        bpasw = config.getKey('document_bucket_access_secret')
        if 'office_id' not in params:
            raise Exception('OFFICEID_REQUIRED')
        office_id = params['office_id']
        db = Query()
        if 'form' in params:
            self.consentForm(db,params['form'],office_id,user['user_id'])
        if 'documents' in params:
            for x in params['documents']:
                if 'id' in x and x['id'] != 0:  # If its already there, dont save it
                    continue
                if 'content' not in x:
                    continue
                o = db.query("""
                    select id from user_upload_email where user_id=%s and office_id=%s
                    """,(user['user_id'],params['office_id'])
                )
                if len(o) < 1:
                    raise Exception("USER_UPLOAD_MISSING")
                uueid = o[0]['id']
                uploadDocument(office_id,user['user_id'],uueid,x['content'],x['description'])
        return {'success': True}


class UserSetupIntent(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        st = Stripe.Stripe()    
        cust_id = st.getStripeID(user['user_id'])
        if cust_id is None:
            cust_id = st.createCustomer(params,user['user_id'])
        ret = st.setupIntent(params,cust_id,user['user_id'])
        return ret

class UserCardUpdateDefault(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        card_id = params['id']
        db.update("""
            update user_cards set updated=now(),is_default=0 where is_default=1 and user_id=%s
            """,(user['user_id'],)
        )
        db.update("""
            update user_cards set updated=now(),is_default=%s where id=%s and user_id=%s
            """,(params['is_default'],params['id'],user['user_id'],)
        )
        db.commit()
        ret['success'] = True
        return ret
            

class UserCardUpdate(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return True

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        st = Stripe.Stripe()
        sid = None
        o = db.query("""
            select stripe_customer_id from users where id=%s
            """,(user['user_id'],)
        )
        sid = o[0]['stripe_customer_id']
        pid = st.confirmCard(params,user['user_id'],sid)
        db.update("""
            insert into user_cards(user_id,card_id,last4,exp_month,exp_year,client_ip,payment_id) values (
                %s,%s,%s,%s,%s,%s,%s
            )
            """,(user['user_id'],params['card_id'],params['card_details']['last4'],
                 params['card_details']['exp_month'],params['card_details']['exp_year'],
                 params['client_ip'],pid['payment_method']
            )
        )
        db.commit()
        ret['success'] = True
        return ret
            
class UserDashboard(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getAppointments(self,user_id,lat,lon):
        uc = UserConfig()
        o = uc.getAppointments(user_id,lat,lon,True)
        return o

    def getInvoices(self,user_id,unpaid):
        uc = UserConfig()
        o = uc.getInvoices(user_id,unpaid)
        return o

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'location' not in params:
            lon,lat = self.getUserLonLat(user['user_id'])
        else:
            lat = params['location']['lat']
            lon = params['location']['lon']
        ret['appt'] = self.getAppointments(user['user_id'],lat,lon) 
        ret['invoices'] = self.getInvoices(user['user_id'],True) 
        return ret
            
class UserRatings(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'appt_id' not in params:
            return {'success':True}
        q = db.query(""" select user_id from physician_schedule 
            where id=%s
            """,(params['appt_id'],)
        )
        val = 0
        if len(q) < 1:
            return {'success':True}
        try:
           val = int(params['rating']) 
           if val < 1:
                val = val * -1
        except:
            return {'success':True}
        user_id = q[0]['user_id']
        if not params['text']:
            params['text'] = ''
        # TODO: Filter out bad words and other content
        db.update("""
            delete from ratings where physician_schedule_id=%s
            """,(params['appt_id'],)
        )
        db.update("""
            insert into ratings (user_id,physician_schedule_id,rating,text) 
            values (%s,%s,%s,%s)
            """,(user_id,params['appt_id'],val,params['text'])
        )
        db.commit()
        return {'success':True}
