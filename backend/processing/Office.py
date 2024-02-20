# coding=utf-8

import sys
import os
import json
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))

from util import encryption
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
                i.nextcheck,i.bundle_id,stripe_invoice_number as number,
                u.first_name,u.last_name,ps.day,ps.time,s.name as subprocedure_name,
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
                subprocedures s,
                office o,
                invoice_status ist
            where
                u.id = i.user_id and
                pss.physician_schedule_id = ps.id and
                pss.subprocedures_id = s.id and
                i.physician_schedule_id = ps.id and
                i.id = ii.invoices_id and
                o.id = i.office_id and
                sis.invoices_id = i.id and 
                ist.id = i.invoice_status_id and
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
               json_arrayagg(
                    json_object(
                        'procedure',p.id
                    )
               ) as procs,ou.office_id as office_id
            from
                office_user ou
                left join users u on ou.user_id = u.id
                left outer join procedures_phy pp on pp.user_id=u.id
                left join procedures p on p.id=pp.procedures_id
            where
                ou.user_id = u.id and
                office_id = %s
            group by 
                ou.user_id
            """,(group_id,)
        )
        ret['procedures'] = db.query("select id,name from procedures")
        fin = []
        for x in o:
            j = json.loads(x['procs'])
            x['procs'] = []
            if j[0]['procedure'] == None:
                x['procs'] = []
            else:
                HAVE = {}
                for q in j:
                    b = q['procedure']
                    if b in HAVE:
                        continue
                    x['procs'].append({'procedure':b})
                    HAVE[b] = 1
            fin.append(x)
        ret['physicians'] = o
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

class TransfersList(OfficeBase):

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
        o = db.query("""
            select
                ot.id,ot.office_id,o.name as office_name,u.id as user_id,
                u.first_name,u.last_name,u.email,stripe_transfer_id,
                amount,ot.created,ot.invoices_id
            from
                office_transfers ot, users u, office o
            where
                u.id=ot.user_id and
                o.id=ot.office_id and
                o.id=%s
            """,(off_id,)
        )
        ret['transfers'] = o
        return ret

class AssociationList(OfficeBase):

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
        o = db.query("""
            select o.id,o.name
            from 
                office o, office_associations oa
            where 
                o.id=oa.to_office_id  and
                oa.from_office_id = %s
            """,(off_id,))
        ret['assigned'] = o
        lat = 0
        lon = 0
        l = db.query("""
            select 
                oa.lat,oa.lon
            from 
                office o, office_addresses oa
            where 
                o.id=oa.office_id and
                o.id = %s
            """,(off_id,))
        if len(l) > 0:
            lat = l[0]['lat']
            lon = l[0]['lon']
        offices = db.query("""
            select
                o.id,o.name,
                st_distance_sphere(point(%s,%s),point(lon,lat))*.000621371192 as miles,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',oa.id,'addr1',oa.addr1,'addr2',oa.addr2,'phone',oa.phone,
                        'lat',oa.lat,'lon',oa.lon, 'city',oa.city,'state',
                        oa.state,'zipcode',oa.zipcode)
                ) as addr
            from 
                office o, office_addresses oa
            where
                o.id = oa.office_id and
                and o.id <> %s
                st_distance_sphere(point(%s,%s),point(lon,lat))*.000621371192 < 50
            """,(lon,lat,off_id,lon,lat)
        )
        ret['offices'] = []
        for j in offices:
            j['addr'] = json.loads(j['addr'])
            ret['offices'].append(j)
        return ret

class AssociationUpdate(OfficeBase):

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
        db = Query()
        db.update("""
            insert into office_associations 
                (to_office_id,from_office_id) values (%s,%s)
        """,(params['office_id'],off_id)
        )
        db.commit()
        return {'success': True}
