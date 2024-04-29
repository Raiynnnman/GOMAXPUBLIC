# coding=utf-8

import sys
import os
import base64
import json
import unittest
import jwt
import pandas as pd

sys.path.append(os.path.realpath(os.curdir))

from util import encryption,S3Processing,calcdate
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_office

log = Logging()
config = settings.config()
config.read("settings.cfg")

class OfficeBase(SubmitDataRequest):

    def __init__(self):
        super().__init__()

class OfficeDashboard(OfficeBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getCustomers(self,off_id):
        db= Query()
        CI = self.getClientIntake()
        o = db.query("""
            select
                ifnull(t1.num1,0) as num1, /* */
                ifnull(t2.num2,0) as num2, /* */
                ifnull(t3.num3,0) as num3, /* */
                ifnull(t4.num4,0) as num4
            from
                (select count(ci.id) as num1 from 
                    client_intake_offices cio,client_intake ci
                    where 
                    cio.client_intake_id=ci.id and hidden=0 and
                    office_id = %s) as t1,
                (select count(ci.id) as num2 from 
                    client_intake_offices cio,client_intake ci
                    where 
                        cio.client_intake_id=ci.id and hidden=0 and
                        office_id = %s and month(ci.created) = month(now())
                        and year(ci.created) = year(now())) as t2,
                (select count(ci.id) as num3 from 
                    client_intake_offices cio,client_intake ci
                    where 
                    cio.client_intake_id=ci.id and hidden=0 and
                    office_id = %s and year(ci.created) = year(now())) as t3,
                (select count(ci.id) as num4 from client_intake_offices cio,
                    client_intake ci
                    where 
                    cio.client_intake_id=ci.id and office_id = %s and hidden=0
                    and client_intake_status_id=%s) as t4
            """,(off_id,off_id,off_id,off_id,CI['COMPLETED']))
        return o[0]

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        ret['customers'] = self.getCustomers(off_id)
        return ret

class OfficeInvoicesList(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        ret['config'] = {}
        ret['config']['status'] = db.query("select id,name from invoice_status")
        ret['config']['status'].insert(0,{'id':0,'name':'All'})
        ret['invoices'] = []
        o = db.query("""
            select
                i.id,ist.name as invoice_status,i.physician_schedule_id,
                i.nextcheck,stripe_invoice_number as number,
                invoice_pdf_url, invoice_pay_url, 
                amount_due, amount_paid,
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
                stripe_invoice_status sis,
                office o,
                invoice_status ist
            where
                i.id = ii.invoices_id and
                o.id = i.office_id and
                sis.invoices_id = i.id and 
                ist.id = i.invoice_status_id and
                ist.id > 5 and
                i.office_id = %s
            group by
                i.id
            """,(off_id,))
        for x in o:
            if x['id'] is None:
                continue
            x['items'] = json.loads(x['items'])
            ret['invoices'].append(x)
        return ret

class PhysicianList(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        group_id = user['offices'][0]
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        o = db.query(
            """
            select
               u.id,email,first_name,last_name,phone_prefix,phone,title,active,
               ou.office_id as office_id,round(avg(ifnull(r.rating,0)),2) as rating,
               0 as miles
            from
                office_user ou
                left join users u on ou.user_id = u.id
                left outer join ratings r on r.user_id=u.id
            where
                ou.user_id = u.id and
                ou.office_id = %s
            group by 
                ou.user_id
            """,(group_id,)
        )
        fin = []
        ret['physicians'] = []
        for x in o:
            x['locations'] = db.query("""
                select
                    oa.id,oa.addr1,
                    oa.city,oa.state,
                    oa.zipcode,oa.lat,
                    oa.lon
                from 
                    office_providers op
                    left join users u on op.user_id=u.id
                    left outer join office_addresses oa on oa.id = op.office_addresses_id
                where
                    oa.office_id=%s and
                    op.user_id=%s
                """,(group_id,x['id'])
            )
            ret['physicians'].append(x)
        return ret

class PhysicianSave(OfficeBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        group_id = user['offices'][0]
        db = Query()
        insid = 0
        uid = db.query("""
            select id from users where email = %s
            """,(params['email'],)
        )
        if len(uid) > 0:
            params['id'] = uid[0]['id']
        if 'id' not in params:
            db.update("""
                insert into users(email,first_name,last_name,phone,title)  values
                    (
                        %s,%s,%s,%s,%s
                    )
            """,(params['email'].lower(),params['first_name'],params['last_name'],
                    params['phone'],params['title'])
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
        else:
            db.update("""
                update users set updated=now(),
                    email=%s,first_name=%s,last_name=%s,phone=%s,title=%s where id = %s
                """,(params['email'],params['first_name'],params['last_name'],
                        params['phone'],params['title'],params['id'])
            )
            insid = params['id']
        if 'procs' in params:
            db.update("delete from procedures_phy where user_id=%s", (insid,))
            db.commit()
            for x in params['procs']:
                db.update("""
                    insert into procedures_phy (user_id,procedures_id,subprocedures_id) 
                      select %s,%s,id from subprocedures where procedures_id=%s
                    """, (insid,x['procedure'],x['procedure'])
                )
            db.commit()
        oid = db.query(
            """
                select user_id from office_user where user_id=%s and office_id=%s
            """,(insid,group_id)
        )
        if len(oid) < 1:
            db.update("insert into physician_about(user_id) values(%s)",(insid,))
            db.update("insert into physician_media(user_id) values(%s)",(insid,))
            db.update("""
                insert into office_user (office_id,user_id) values (%s,%s)
                """,(group_id,insid)
            )
        db.commit()
        return {'success':True}

class UsersList(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        group_id = user['offices'][0]
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        o = db.query("""
            select
               u.id,u.first_name,u.last_name,u.phone,u.email,u.active,
               json_arrayagg(
                ue.entitlements_id
               ) as entitlements
            from
                users u
                left join office_user ou on ou.user_id=u.id
                left outer join user_entitlements ue on ue.user_id=u.id
            where
                ou.user_id=u.id
                and office_id=%s
            group by 
                u.id
            """,(off_id,))
        ret['users'] = []
        for x in o:
            if x is None:
                x['entitlements'] = []
            else:
                x['entitlements'] = json.loads(x['entitlements'])
            ret['users'].append(x)
        ent = self.getEntitlementIDs()
        ret['entitlements'] = []
        ret['entitlements'].append({'name': 'Admin', 'id':ent['OfficeAdmin']}) 
        ret['entitlements'].append({'name': 'Billing', 'id': ent['OfficeBilling']}) 
        ret['entitlements'].append({'name': 'Scheduling', 'id': ent['OfficeSchedule']}) 
        return ret

class UsersUpdate(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def addUser(self,params,off_id,db):
        o = db.query("""
            select id from users where email = %s
            """,(params['email'],)
        )
        if len(o) > 0:
            return o[0]['id']
        db.update("""
            insert into users (email,first_name,last_name) values 
                (%s,%s,%s)
            """,(params['email'].lower(),params['first_name'],params['last_name'])
        )
        insid = db.query("select LAST_INSERT_ID()");
        insid = insid[0]['LAST_INSERT_ID()']
        db.commit()
        db.update("""
            insert into office_user (office_id,user_id) values (%s,%s)
            """,(off_id,insid)
        )
        db.commit()
        return insid

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        ENT = self.getEntitlementIDs()
        PERM = self.getPermissionIDs()
        insid = 0
        db = Query()
        if 'id' in params:
            db.update("""
                update users set updated=now(),first_name=%s,last_name=%s where id=%s
                """,(params['id'],params['first_name'],params['last_name'])
            )
            insid = params['id']
        else:
            self.addUser(params,db)
        if 'entitlements' in params:    
            db.update("delete from user_entitlements where user_id=%s",(insid,))
            db.update("delete from user_permissions where user_id=%s",(insid,))
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values
                (%s,%s)
            """,(insid,ENT['Office'])
            )
            db.update("""
                insert into user_permissions (user_id,permissions_id) values
                (%s,%s)
            """,(insid,PERM['Write'])
            )
            for x in params['entitlements']:
                db.update("""
                    insert into user_entitlements (user_id,entitlements_id) values
                    (%s,%s)
                    """,(insid,x)
                )
        db.commit()
        ret['success'] = True
        return ret

class ClientList(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
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
        inputs = [
                {'l':'Description of accident','f':'description','t':'textfield','v':''},
                {'l':'Hospital','f':'hospital','t':'checkbox','v':0},
                {'l':'Ambulance','f':'ambulance','t':'checkbox','v':0},
                {'l':'Witnesses','f':'witnesses','t':'textfield','v':''},
                {'l':'Reporting Law Enforment Agency','f':'rep_law_enforcement','t':'text','v':''},
                {'l':'Police Report #','f':'police_report_num','t':'text','v':''},
                {'l':'Citations','f':'citations','t':'text','v':''},
                {'l':'Who was cited','f':'citations_person','t':'text','v':''},
                {'l':'Pics of damage','f':'pics_of_damage','t':'checkbox','v':0},
                {'l':'Passengers in Vehicle','f':'passengers','t':'textfield','v':''},
                {'l':'Def Insurance Info','f':'def_insurance','t':'text','v':''},
                {'l':'Claim #/Policy #','f':'def_claim_num','t':'text','v':''},
                {'l':'Def Name#','f':'def_name','t':'text','v':''},
                {'l':'PIP Insurance Info','f':'ins_info','t':'text','v':''},
                {'l':'Claim #/Policy #','f':'ins_claim_num','t':'text','v':''},
                {'l':'Policy Holder','f':'ins_policy_holder','t':'text','v':''},
              ]
        cols = []
        CI = self.getClientIntake()
        for g in inputs:
            cols.append(g['f'])
        o = db.query("""
            select
                ci.id,u.first_name as client_first,
                u.last_name as client_last, 
                u.id as user_id,
                concat(u.first_name,' ', u.last_name) as name,
                u.email email, u.phone as phone,
                u2.id as phy_id,u2.first_name as phy_first,
                u2.last_name as phy_last,cis.name as status,
                cis.id as status_id,
                """ + ','.join(cols) + """
            from
                users u,
                users u2,
                office o,
                client_intake ci,
                client_intake_status cis,
                client_intake_offices cio
            where
                cio.client_intake_id = ci.id and
                cis.id = ci.client_intake_status_id and
                ci.user_id = u.id and
                hidden = 0 and
                o.id = cio.office_id and
                cio.phy_id = u2.id and
                o.id=%s and
                cis.id < %s 
            """,(off_id,CI['COMPLETED'])
        )
        ret['clients'] = []
        for x in o:
            j = x
            g = db.query("""
                select fulladdr from user_addresses
                    where user_id = %s
                """,(x['user_id'],)
            )
            j['address'] = ''
            for z in g:
                j['addr'] = z['fulladdr']
            ret['clients'].append(j)
        ret['config'] = {}
        ret['config']['status'] = db.query("""
            select id,name from client_intake_status""")
        return ret

class ClientUpdate(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        db.update("""
            update client_intake set client_intake_status_id = %s
                where id = %s
            """,(params['status_id'],params['id'])
        )
        db.commit()
        ret['success'] = True
        return ret

class ReferrerDashboard(OfficeBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getCustomers(self,off_id):
        db= Query()
        CI = self.getReferrerUserStatus()
        o = db.query("""
            select
                ifnull(t1.num1,0) as num1, /* */
                ifnull(t2.num2,0) as num2, /* */
                ifnull(t3.num3,0) as num3, /* */
                ifnull(t4.num4,0) as num4
            from
                (select count(ci.id) as num1 from 
                    referrer_users ci
                    where 
                    referrer_id = %s) as t1,
                (select count(ci.id) as num2 from 
                    referrer_users ci
                    where 
                        referrer_id = %s and month(ci.created) = month(now())
                        and year(ci.created) = year(now())) as t2,
                (select count(ci.id) as num3 from 
                    referrer_users ci
                    where 
                    referrer_id = %s and year(ci.created) = year(now())) as t3,
                (select count(ci.id) as num4 from client_intake_offices cio,
                    referrer_users ci,referrer_users_status rus
                    where 
                    referrer_id = %s and
                    ci.referrer_users_status_id = rus.id 
                    and ci.referrer_users_status_id=%s) as t4
            """,(off_id,off_id,off_id,off_id,CI['REFERRED']))
        return o[0]

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        ret['clients'] = self.getCustomers(off_id)
        return ret

class ReferrerUpdate(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return True

    def processRow(self,office_id,row,docid,db):
        o = db.query("""
            select id from referrer_users where
                office_id = %s and phone = %s 
                and name = %s
            """,(office_id,row['name'],row['name'])
        )
        if len(o) > 0:
            print("WARNING: Dup detected skipping")
            return
        db.update("""
            insert into referrer_users 
                (referrer_id,referrer_users_status_id,referrer_documents_id,row_meta) 
                values (%s,1,%s,%s)
            """,(office_id,docid,json.dumps(row))
        )
        insid = db.query("select LAST_INSERT_ID()");
        insid = insid[0]['LAST_INSERT_ID()']
        if 'name' in row:
            db.update("""
                update referrer_users set name=%s where id = %s
                """,(row['name'],insid)
            )
        if 'email' in row:
            db.update("""
                update referrer_users set email=%s where id = %s
                """,(row['email'],insid)
            )
        if 'phone' in row:
            db.update("""
                update referrer_users set phone=%s where id = %s
                """,(row['phone'],insid)
            )
        if 'zipcode' in row:
            lat = lon = 0 
            o = db.query("""
                select lat,lon from position_zip where zipcode=%s
                """,(row['zipcode'],)
            )
            if len(o) > 0:
                lat = o[0]['lat']
                lon = o[0]['lon']
            db.update("""
                update referrer_users set zipcode=%s,lat=%s,lon=%s where id = %s
                """,(row['zipcode'],lat,lon,insid)
            )

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        s3path = 'referrer/%s/%s' % (
            off_id,
            encryption.getSHA256("%s-%s" % (off_id,calcdate.getTimestampUTC()))
        )
        ext = '.json'
        if 'content' in params:
            data = params['content'].split('base64,')
            if len(data) != 2:
                raise Exception('CONTENT_MALFORMED')
            cont = base64.b64decode(data[1])
            ext = '.xlsx'
            path = '%s%s' % (s3path,ext)
            q=db.update("""
                insert into referrer_documents (office_id,s3path) values 
                    (%s,%s)
            """,(off_id,path)
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            S3Processing.uploadS3ItemToBucket(
                config.getKey("document_bucket_access_key"),
                config.getKey("document_bucket_access_secret"),
                config.getKey("document_bucket"),
                path,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                cont
            )
            df = pd.read_excel(cont)
            df = df.fillna('')
            df.columns = [x.lower() for x in df.columns]
            df = df.to_dict(orient='index')
            for x in df:
                self.processRow(off_id,df[x],insid,db)
        else:
            path = '%s%s' % (s3path,ext)
            q=db.update("""
                insert into referrer_documents (office_id,s3path) values 
                    (%s,%s)
            """,(off_id,path)
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            S3Processing.uploadS3ItemToBucket(
                config.getKey("document_bucket_access_key"),
                config.getKey("document_bucket_access_secret"),
                config.getKey("document_bucket"),
                path,
                "application/json",
                json.dumps(params['clients'])
            )
            for x in params['clients']:
                self.processRow(off_id,x,insid,db)
        db.commit()
        ret['success'] = True
        return ret

class LocationUpdate(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        print(params)
        if 'id' in params:
            db.update("""
                update office_addresses set name = %s,
                    addr1=%s,city=%s,state=%s,zipcode=%s,phone=%s,
                    lat=0,lon=0,places_id=null,lat_attempt_count=0,
                    nextcheck=null
                    where id = %s
                """,(params['name'],
                     params['addr1'],
                     params['city'],
                     params['state'],
                     params['zipcode'],
                     params['phone'],
                     params['id'])
            )
        else:
            db.update("""
                insert into office_addresses (
                    office_id,name,addr1,city,state,zipcode,phone,full_addr)
                    values (%s,%s,%s,%s,%s,%s,%s,%s)
                """,(off_id,params['name'],
                     params['addr1'],
                     params['city'],
                     params['state'],
                     params['zipcode'],
                     params['phone'],
                     params['fulladdr']
                )
            )
        db.commit()
        ret['success'] = True
        return ret

class LocationList(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        o = db.query("""
            select 
                oa.id,oa.name,oa.phone,oa.addr1,oa.city,oa.state,oa.zipcode,
                    oa.lat as lat, oa.lon as lng,
                    round(avg(ifnull(r.rating,0)),2) as rating
            from 
                office_addresses oa
                left outer join ratings r on r.office_id = oa.office_id
            where oa.office_id = %s
            """,(off_id,)
        )
        ret['locations'] = []
        for x in o:
            if x['id'] is None:
                continue
            x['providers'] = db.query("""
                select 
                    u.id,u.email,u.first_name,u.last_name,
                    opa.text,opm.headshot
                from 
                    office_addresses oa
                    left join office_providers op on op.office_addresses_id = oa.id
                    left join users u on op.user_id = u.id
                    left outer join office_provider_about opa on opa.user_id=u.id
                    left outer join office_provider_media opm on opm.user_id=u.id
                where oa.id=%s
                """,(x['id'],)
            ) 
            ret['locations'].append(x)
        db.commit()
        ret['success'] = True
        return ret
