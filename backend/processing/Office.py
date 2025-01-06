# coding=utf-8

import sys
import os
import traceback
import pyap
import base64
import json
from nameparser import HumanName
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
from util.Mail import Mail

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

    def getCustomers(self, off_id):
        db = Query()
        CI = self.getClientIntake()
        o = db.query("""
            SELECT
                IFNULL(t1.num1, 0) AS num1, /* */
                IFNULL(t2.num2, 0) AS num2, /* */
                IFNULL(t3.num3, 0) AS num3, /* */
                IFNULL(t4.num4, 0) AS num4
            FROM
                (SELECT COUNT(ci.id) AS num1 FROM 
                    client_intake_offices cio, client_intake ci
                    WHERE 
                    cio.client_intake_id = ci.id AND hidden = 0 AND
                    office_id = %s) AS t1,
                (SELECT COUNT(ci.id) AS num2 FROM 
                    client_intake_offices cio, client_intake ci
                    WHERE 
                        cio.client_intake_id = ci.id AND hidden = 0 AND
                        office_id = %s AND MONTH(ci.created) = MONTH(NOW())
                        AND YEAR(ci.created) = YEAR(NOW())) AS t2,
                (SELECT COUNT(ci.id) AS num3 FROM 
                    client_intake_offices cio, client_intake ci
                    WHERE 
                    cio.client_intake_id = ci.id AND hidden = 0 AND
                    office_id = %s AND YEAR(ci.created) = YEAR(NOW())) AS t3,
                (SELECT COUNT(ci.id) AS num4 FROM client_intake_offices cio,
                    client_intake ci
                    WHERE 
                    cio.client_intake_id = ci.id AND office_id = %s AND hidden = 0
                    AND cio.client_intake_status_id = %s) AS t4
            """, (off_id, off_id, off_id, off_id, CI['COMPLETED']))
        return o[0]

    def getOfficeNotifications(self, off_id):
        db = Query()
         #This query's primary goal is to group by `notifiable_type`.
         #It does this by finding the maximum value of `acknowledged` 
         #and `office_notifications_category_id` for each type.
         #`notification_count` is the column that represents the tally or the total number of notifications 
         #for each type with the `office_id` of 14041.
        notifications = db.query("""
            SELECT 
                onf.notifiable_type, 
                MAX(onf.acknowledged) AS acknowledged,   
                MAX(onf.office_notifications_category_id) AS office_notifications_category_id,  
                COUNT(onf.id) AS notification_count
            FROM 
                office o
            JOIN 
                office_notifications onf ON o.id = onf.office_id
            JOIN 
                office_notifications_category onc ON onf.office_notifications_category_id = onc.id
            WHERE 
                o.id = %s
            GROUP BY 
                onf.notifiable_type
            """, (off_id,))
        return notifications

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job, user, off_id, params = self.getArgs(*args, **kwargs)
        ret['customers'] = self.getCustomers(off_id)
        ret['notifications'] = self.getOfficeNotifications(off_id)
        print(ret['notifications'])
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
            db.update("insert into office_provider_about(user_id) values(%s)",(insid,))
            db.update("insert into office_provider_media(user_id) values(%s)",(insid,))
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
            self.addUser(params,off_id,db)
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

class ProfileUpdate(OfficeBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        print(params)
        db.commit()
        return {'success':True}

