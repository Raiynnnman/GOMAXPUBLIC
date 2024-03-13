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

class AdminBase(SubmitDataRequest):
    def __init__(self):
        super().__init__()

class AdminDashboard(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getLeadsStatus(self):
        db= Query()
        o = db.query("""
            select
                0 as num1, /* num leads */
                0 as num2, /* leads won */
                0 as num3, /* leads lost */
                0 as num4 /* leads invalid */
            """)
        return o[0]

    def getVisits(self):
        db = Query()
        o = db.query("""
            select 
                ifnull(t1.num1,0) as num1,
                ifnull(t2.num2,0) as num2,
                ifnull(round((t2.num2/t1.num1)*100,2),0) as num3,
                ifnull(t4.num4,0) as num4
            from 
                (select count(id) as num1 from visits where created > date(now())) as t1,
                (select count(id) as num2 from users where created > date(now())) as t2,
                (select count(id) as num4 from physician_schedule_scheduled where created > date(now())) as t4
            """
        )
        return o[0]

    def getTrafficMonth(self):
        db = Query()
        o = db.query("""
            select 
                0 as num1, /* num accidents */
                0 num2, /* providers selected */
                0 num3, /* sales */
                0 num4  /* */
            """
        )
        return o[0]

    def getLeadsRevenueMonth(self):
        db = Query()
        o = db.query("""
            select 
                0 as num1, /* num leads */
                0 num2, /* revenue */
                0 num3, /* sales */
                0 num4  /* leads that have generated appt */
            """
        )
        return o[0]
    def getRevenueThisMonth(self):
        db = Query()
        o = db.query("""
            select 
                ifnull(t1.num1,0) as num1, /* our revenue */
                ifnull(t2.num2,0) as num2, /* revenue */
                ifnull(t3.num3,0) as num3, /* count bundles */
                ifnull(t4.num4,0) as num4
            from 
                (select round(sum(total),2) as num1 from invoices a
                    where a.created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                /* total twice, need to fix */
                (select round(sum(total),2) as num2 from invoices a
                    where a.created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                (select count(id) as num3 from appt_scheduled where created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                (select count(id) as num4 from physician_schedule_scheduled where created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
            """
        )
        return o[0]

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        ret['visits'] = self.getVisits()
        ret['revenue_month'] = self.getRevenueThisMonth()
        ret['revenue_leads_month'] = self.getLeadsRevenueMonth()
        ret['lead_status'] = self.getLeadsStatus()
        return ret

class UserList(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        print(params)
        ENT = self.getEntitlementIDs()
        q = """
            select 
                u.id,u.email,u.first_name,u.last_name,
                u.phone,u.active
            from 
                users u
            where 
                id <> 1
            order by 
                updated desc
            """
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,))
        q += " limit %s offset %s " 
        o = db.query(q,(limit,offset*limit))
        ret['total'] = cnt[0]['cnt']
        ret['config'] = {}
        ret['config']['permissions'] = self.getPermissionIDs()
        ret['config']['entitlements'] = self.getEntitlementIDs()
        ret['users'] = []
        for x in o:
            x['entitlements'] = db.query("""
                 select e.id,e.name from user_entitlements ue,entitlements e
                 where user_id=%s and e.id=ue.entitlements_id
                """,(x['id'],))
            x['permissions'] = db.query("""
                 select e.id,e.name from user_permissions ue,permissions e
                 where user_id=%s and e.id=ue.permissions_id
                """,(x['id'],))
            x['offices'] = db.query("""
                 select e.id,e.name from office_user ue,office e
                 where ue.user_id=%s and e.id=ue.office_id
                """,(x['id'],))
            ret['users'].append(x)
        return ret

class LegalList(AdminBase):
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
        o = db.query("""
            select 
                c.id,c.name,active,email,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',oa.id,'addr1',oa.addr1,'addr2',oa.addr2,'phone',oa.phone,
                        'city',oa.city,'state',oa.state,'zipcode',oa.zipcode)
                ) as addr
            from 
                office c 
                left outer join office_addresses oa on oa.office_id=c.id
            where 
                c.office_type_id = %s 
            group by 
                c.id
            """,(OT['Legal'],)
        )
        ret['legals'] = o
        return ret

class LegalUpdate(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        o = db.query("""
            select id from users where email=%s""",(params['email'].lower(),)
        )
        user_id = 0
        isnew = False
        if 'first_name' not in params or params['first_name'] == '':
            return { 'success': False, 'message': 'CONSULTANT_FIRSTNAME_REQUIRED' }
        if 'last_name' not in params or params['last_name'] == '':
            return { 'success': False, 'message': 'CONSULTANT_LASTNAME_REQUIRED' }
        if 'email' not in params or params['email'] == '':
            return { 'success': False, 'message': 'CONSULTANT_EMAIL_REQUIRED' }
        if 'phone' not in params or params['phone'] == '':
            return { 'success': False, 'message': 'CONSULTANT_PHONE_REQUIRED' }
        if 'addr1' not in params or params['addr1'] == '':
            return { 'success': False, 'message': 'CONSULTANT_ADDR1_REQUIRED' }
        if 'city' not in params or params['city'] == '':
            return { 'success': False, 'message': 'CONSULTANT_CITY_REQUIRED' } 
        if 'state' not in params or params['state'] == '':
            return { 'success': False, 'message': 'CONSULTANT_STATE_REQUIRED' } 
        if 'zipcode' not in params or params['zipcode'] == '':
            return { 'success': False, 'message': 'CONSULTANT_ZIP_REQUIRED' } 
        if 'addr2' not in params:
            params['addr2'] = ''
        if len(o) < 1:
            isnew = True
            db.update("""
                insert into users (email,first_name,last_name,phone) values (
                    %s,%s,%s,%s
                )
                """,(params['email'].lower(),params['first_name'],params['last_name'],params['phone'])
            )
            db.commit()
            user_id = db.query("select LAST_INSERT_ID()");
            user_id = user_id[0]['LAST_INSERT_ID()']
            PERM = self.getPermissionIDs()
            ENT = self.getEntitlementIDs()
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
                """,(user_id,ENT['Legal'])
            )
            db.update("""
                insert into user_permissions (user_id,permissions_id) values (%s,%s)
                """,(user_id,PERM['Write'])
            )
            db.commit()
        else:
            user_id = o[0]['id']
        if 'id' in params and params['id'] != 0:
            db.update("""
                update users set updated=now(), 
                email=%s,first_name=%s,last_name=%s,phone=%s where id=%s
                """, (params['email'].lower(), params['first_name'],
                      params['last_name'], params['phone'], params['id'])
                      )
            db.update("""
                update office set updated=now(),active=%s,addr1=%s,addr2=%s,
                phone=%s,city=%s,state=%s,zipcode=%s where user_id=%s
                """,(params['active'],params['addr1'],params['addr2'],
                     params['phone'],params['city'],params['state'],
                     params['zipcode'],params['id']
                )
            )
        else:
            db.update("""
                insert into office (name,user_id,addr1,addr2,phone,city,state,zipcode,office_type_id) values
                (%s,%s,%s,%s,%s,%s,%s,%s,%s,2)
                """,(user_id,params['name'],params['addr1'],params['addr2'],
                     params['phone'],params['city'],params['state'],
                     params['zipcode']
                )
            )
            we = WelcomeEmail()
            we.execute(*args,**kwargs)
        db.commit()
        return {'success': True}

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
        if 'id' not in params:
            raise Exception('ID_REQUIRED')
        if 'comments' in params:
            for x in params['comments']:
                if 'id' in x:
                    continue
                bb2 = encryption.encrypt(
                    x['text'],
                    config.getKey('encryption_key')
                    )
                db.update("""
                    insert into invoices_comment (user_id,invoices_id,text)
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
        ret['config']['status'].insert(0,{'id':0,'name':'All'})
        ret['invoices'] = []
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
                round(i.total,2) as total
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
        p = []
        if 'filter' in params and params['filter'] != 0:
            q += " and invoice_status_id = %s " 
            p.append(params['filter'])
        p.append(limit)
        p.append(offset*limit)
        q += "group by i.id order by billing_period desc"
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,))
        ret['total'] = cnt[0]['cnt']
        q += " limit %s offset %s " 
        o = db.query(q,p)
        for x in o:
            x['items'] = json.loads(x['items'])
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
                order by created desc
                """,(x['id'],)
            )
            for cc in comms: 
                bb2 = encryption.decrypt(
                    cc['text'],
                    config.getKey('encryption_key')
                    )
                cc['text'] = bb2
                x['comments'].append(cc)
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

class WelcomeEmail(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = []
        params = args[1][0]
        if 'email' not in params:
            raise Exception('EMAIL_REQUIRED')
        email = params['email'].lower()
        db = Query()
        o = db.query("""
            select id from users where email=%s
        """,(email,)
        )
        if len(o) < 1:
            ret = { 
                "success":False,
                "message": "USER_DOESNT_EXIST"
            }
            return ret
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/login" % (url,),
            '__BASE__':url
        } 
        m = Mail()
        m.defer(email,"Welcome to #PAIN","templates/mail/welcome.html",data)
        return ret

class PlansList(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        OT = self.getOfficeTypes()
        o = db.query(
            """
            select 
                id,price,locations,duration,slot,description,
                start_date,end_date,active,created,updated
            from
                pricing_data 
            where
                end_date > now() and
                active = 1
            order by
                start_date
            """
        )
        ret = o
        return ret

class OfficeList(AdminBase):

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
        OT = self.getOfficeTypes()
        q = """
                select 
                    o.id,o.name,o.active,o.email,pqs.name as status,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',oa.id,'addr1',oa.addr1,'addr2',oa.addr2,'phone',oa.phone,
                            'city',oa.city,'state',oa.state,'zipcode',oa.zipcode)
                    ) as addr,u.phone,u.first_name,u.last_name
                from 
                    office o
                left outer join office_addresses oa on oa.office_id=o.id
                left outer join provider_queue pq on pq.office_id = o.id
                left outer join provider_queue_status pqs on pq.provider_queue_status_id=pqs.id
                left join  users u on u.id = o.user_id
                where 
                    o.office_type_id = %s
                group by 
                    o.id
            """ % OT['Chiropractor']
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,))
        q += " limit %s offset %s " 
        ret['total'] = cnt[0]['cnt']
        o = db.query(q,(limit,offset*limit))
        ret['offices'] = []
        for x in o:
            x['addr'] = json.loads(x['addr'])
            t = db.query("""
                select 
                    i.id,i.invoice_status_id,isi.name as status,i.total,i.billing_period,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',ii.id,'price',ii.price,
                            'description',ii.description,'quantity',ii.quantity
                        )
                    ) as items
                
                from
                    invoices i,
                    invoice_status isi,
                    invoice_items ii
                where
                    i.invoice_status_id = isi.id and
                    ii.invoices_id = i.id and
                    i.office_id = %s
                group by
                    i.id
                """,(x['id'],)
            )
            x['invoices'] = []
            for j in t:
                if j['id'] is None:
                    continue
                j['items'] = json.loads(j['items'])
                x['invoices'].append(j)
            t = db.query("""
                select 
                    op.id,start_date,end_date,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',opi.id,'price',opi.price,'description',
                            opi.description,'quantity',opi.quantity
                        )
                    ) as items
                from 
                    office_plans op,
                    office_plan_items opi
                where 
                    opi.office_plans_id = op.id and
                    office_id = %s 
            """,(x['id'],)
            )
            x['plans'] = []
            for j in t:
                if j['id'] is None:
                    continue
                x['plans'] = j
                x['plans']['items'] = json.loads(x['plans']['items'])
            ret['offices'].append(x)
        ret['config'] = {}
        ret['config']['provider_status'] = db.query("select id,name from provider_queue_status")
        ret['config']['invoice_status'] = db.query("select id,name from invoice_status")
        return ret

class OfficeSave(AdminBase):
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
        if 'id' not in params:
            db.update("insert into office (name,office_type_id,email) values (%s,%s,%s,%s)",
                (params['name'],OT['Provider'],params['email'])
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
        else:
            db.update("""
                update office set updated=now(),
                    name = %s, 
                    email = %s where id = %s
                """,(params['name'],params['email'],params['id']))
            insid = params['id']
        db.update("""
            delete from office_addresses where office_id = %s
            """,(insid,)
        )
        for x in params['addr']:
            db.update(
                """
                    insert into office_addresses (
                        office_id,addr1,addr2,phone,city,state,zipcode
                    ) values (%s,%s,%s,%s,%s,%s,%s)
                """,(insid,x['addr1'],x['addr2'],x['phone'],x['city'],x['state'],x['zipcode'])
            )
        db.commit()
        return {'success': True}

class CorporationList(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        OT = self.getOfficeTypes()
        ret = db.query("""
            select id,name,active 
            from office
            where 
            office_type_id = %s""",(OT['Corporation'],)
        )
        return ret

class CorporationUpdate(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        OT = self.getOfficeTypes()
        PL = self.getPlans()
        insid = 0
        if 'id' in params:
            db.update("""
                update office set updated=now(),name = %s where id=%s
                """,(params['name'],params['id'],)
            )
        else: 
            db.update("""
                insert into office (name) values (%s)
                """,(params['name'],)
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
        if 'addr' in params:
            g = params['addr']
            g = g[0]
            if 'addr1' in g:
                db.update("""
                    delete from office_addresses where office_id=%s
                    """,(insid,)
                )
                db.update("""
                    insert into office_addresses (office_id,
                        addr1,addr2,phone,zipcode,city,state)
                        values (%s,%s,%s,%s,%s,%s,%s)
                    """,(insid,g['addr1'],g['addr2'],g['phone'],
                         g['zipcode'],g['city'],g['state']
                        )
                )
        db.commit()        
        return ret

class RegistrationUpdate(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        PQS = self.getProviderQueueStatus()
        INV = self.getInvoiceIDs()
        ENT = self.getEntitlementIDs()
        PERM = self.getPermissionIDs()
        BS = self.getBillingSystem()
        OT = self.getOfficeTypes()
        PL = self.getPlans()
        PQS = self.getProviderQueueStatus()
        STR = self.getLeadStrength()
        # TODO: Check params here
        email = params['email']
        offid = 0
        userid = 0
        pqid = 0
        planid = 0
        l = db.query("""
            select 
                pq.id,pqs.name,o.name,o.id as office_id,pqs.name as status,
                pq.provider_queue_status_id,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',oa.id,'addr1',oa.addr1,'addr2',oa.addr2,'phone',oa.phone,
                        'city',oa.city,'state',oa.state,'zipcode',oa.zipcode)
                ) as addr,u.first_name,u.last_name,u.email,u.phone,u.id as uid,
                pq.initial_payment,op.id as planid
            from
                provider_queue pq,
                provider_queue_status pqs,
                office o,
                office_addresses oa,
                office_plans op,
                users u,
                office_user ou
            where
                pq.provider_queue_status_id = pqs.id and
                op.office_id = o.id and
                pq.office_id = o.id and
                oa.office_id = o.id and
                ou.office_id = o.id and
                ou.user_id = u.id and
                o.id = %s
            group by 
                o.id
            """,(params['office_id'],)
        )
        for x in l:
            offid = x['office_id']
            pqid = x['id']
            userid = x['uid']
            planid = x['planid']
        if pqid == 0:
            db.update("""
            insert into users (email,first_name,last_name,phone) values
                (%s,%s,%s,%s)
                """,(
                    params['email'],params['first_name'],
                    params['last_name'],params['phone']
                    )
            )
            userid = db.query("select LAST_INSERT_ID()");
            userid = userid[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office(
                        name,office_type_id,email,user_id,billing_system_id
                    ) values
                    (%s,%s,%s,%s,%s)
                """,
                (
                params['name'],OT['Chiropractor'],params['email'],userid,BS
                )
            )
            offid = db.query("select LAST_INSERT_ID()");
            offid = offid[0]['LAST_INSERT_ID()']
            db.update("""
                insert into provider_queue(office_id,provider_queue_lead_strength_id) values (%s,%s)
                """,(offid,STR['Potential Provider'])
            )
            db.update("""
                insert into office_user(office_id,user_id) values
                    (%s,%s)
                """,
                (offid,userid
                )
            )
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
                """,(userid,ENT['Provider'])
            )
            db.update("""
                insert into user_permissions (user_id,permissions_id) values (%s,%s)
                """,(userid,PERM['Admin'])
            )
            selplan = int(params['pricing_id'])
            db.update("""
                insert into office_plans (office_id,start_date,end_date,pricing_data_id) 
                    values (%s,now(),date_add(now(),INTERVAL %s MONTH),%s)
                """,(offid,PL[selplan]['duration'],selplan)
            )
            planid = db.query("select LAST_INSERT_ID()");
            planid = planid[0]['LAST_INSERT_ID()']
            
        db.update("""
            update users set 
                email = %s,first_name=%s,last_name=%s,phone=%s
            where
            id = %s
            """,(
                params['email'],params['first_name'],
                params['last_name'],params['phone'],
                userid
                )
        )
        db.update("""
            update provider_queue set 
                provider_queue_status_id=%s,
                provider_queue_lead_strength_id=%s,
                initial_payment=%s,updated=now()
            where 
                id = %s
            """,(params['status'],params['lead_strength_id'],
                 params['initial_payment'],pqid)
        )
        db.update("""
            update office_plans set pricing_data_id=%s where office_id=%s
            """,(params['pricing_id'],offid)
        )
        db.update("""
            delete from office_plan_items where office_plans_id=%s
            """,(planid,)
        )
        selplan = int(params['pricing_id'])
        db.update("""
            insert into office_plan_items (
                office_plans_id,price,quantity,description) 
            values 
                (%s,%s,%s,%s)
            """,(planid,PL[selplan]['price'],1,PL[selplan]['description'])
                
        )
        db.update("""
            delete from office_addresses where office_id=%s
            """,(offid,)
        )
        for a in params['addr']:
            db.update(
                """
                    insert into office_addresses (
                        office_id,name,addr1,phone,city,state,zipcode
                    ) values (%s,%s,%s,%s,%s,%s,%s)
                """,(offid,a['name'],a['addr1'],a['phone'],a['city'],a['state'],a['zipcode'])
            )
        if 'invoice_id' in params:
            invid = params['invoice_id']
            db.update("""
                delete from invoice_items where invoices_id = %s
                """,(invid,)
            )
            sum = 0
            for y in params['invoice_items']:
                if float(params['initial_payment']) > 0:
                    # If there is an initial payment, charge that upfront
                    desc = 'Subscription Start Payment'
                    if y['description'] != desc:
                        desc = y['description']
                    db.update("""
                        insert into invoice_items (invoices_id,description,price,quantity)
                            values (%s,%s,%s,%s)
                        """,(invid,desc,params['initial_payment'],1)
                    )
                    sum += float(params['initial_payment'])
                    break
                else:
                    sum += y['price'] * y['quantity']
                    db.update("""
                        insert into invoice_items (invoices_id,description,price,quantity)
                            values (%s,%s,%s,%s)
                        """,(invid,y['description'],y['price'],y['quantity'])
                    )
                db.update("""
                    update invoices set total = %s where id = %s
                    """,(sum,invid)
                )
                db.update("""
                    insert into invoice_history (invoices_id,user_id,text) values
                        (%s,%s,%s)
                    """,(invid,user['id'],'Updated Invoice' )
                )
        if params['status'] == PQS['APPROVED']:
            db.update("""
                update office set active = 1 where id = %s
                """,(offid,)
            )
            db.update("""
                update invoices set invoice_status_id = %s where id = %s
            """,(INV['APPROVED'],invid)
            )
            db.update("""
                update provider_queue set 
                    provider_queue_status_id = %s where office_id = %s
            """,(PQS['INVITED'],offid)
            )
            # TODO: Send welcome mail here
        db.commit()
        return ret

class RegistrationList(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10000
        if 'limit' in params:
            limit = params['limit']
        offset = 0
        if 'offset' in params:
            offset = params['offset']
        db = Query()
        PQS = self.getProviderQueueStatus()
        q = """
            select 
                pq.id,o.name,o.id as office_id,pqs.name as status,
                pq.provider_queue_status_id,pq.sf_id,pqls.name as lead_strength,
                pqls.id as lead_strength_id, pq.created,pq.updated,
                pq.initial_payment,ot.name as office_type,op.pricing_data_id as pricing_id
            from
                provider_queue pq
                left outer join office o on pq.office_id = o.id
                left outer join provider_queue_status pqs on pqs.id=pq.provider_queue_status_id
                left outer join provider_queue_lead_strength pqls on pq.provider_queue_lead_strength_id=pqls.id
                left outer join office_plans op on op.office_id = o.id
                left outer join office_type ot on ot.id=o.office_type_id
        """
        status_ids = []
        if 'status' in params:
            q += " where ("
            arr = []
            for z in params['status']:
                arr.append("provider_queue_status_id = %s " % z)
            q += " or ".join(arr)
            q += ")"
        q += """
            order by
                updated desc
        """
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,))
        q += " limit %s offset %s " 
        ret['total'] = cnt[0]['cnt']
        o = []
        o = db.query(q,(limit,offset*limit))
        k = [] 
        for x in o:
            x['addr'] = db.query("""
                select 
                    u.first_name,u.last_name,u.email,u.phone
                from 
                    office_user ou,
                    users u
                where 
                    office_id=%s and
                    ou.user_id = u.id
                """,(x['office_id'],)
            )
            x['last_name'] = x['addr'][0]['last_name'] if len(x['addr']) > 0 else ''
            x['first_name'] = x['addr'][0]['first_name'] if len(x['addr']) > 0 else ''
            x['phone'] = x['addr'][0]['phone'] if len(x['addr']) > 0 else ''
            x['email'] = x['addr'][0]['email'] if len(x['addr']) > 0 else ''
            x['addr'] = db.query("""
                select 
                    oa.id,oa.addr1,oa.addr2,oa.phone,
                    oa.city,oa.state,oa.zipcode,oa.name
                from 
                    office_addresses oa where office_id=%s
                """,(x['office_id'],)
            )
            t = db.query("""
                select 
                    op.id,start_date,end_date,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',opi.id,'price',opi.price,'description',
                            opi.description,'quantity',opi.quantity
                        )
                    ) as items
                from 
                    office_plans op,
                    office_plan_items opi
                where 
                    opi.office_plans_id = op.id and
                    office_id = %s 
            """,(x['office_id'],)
            )
            x['plans'] = {}
            for j in t:
                if j['id'] is None:
                    continue
                x['plans'] = j
                x['plans']['items'] = json.loads(x['plans']['items'])
            t = db.query("""
                select 
                    i.id,i.invoice_status_id,isi.name,i.total,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',ii.id,'price',ii.price,
                            'description',ii.description,'quantity',ii.quantity
                        )
                    ) as items
                
                from
                    invoices i,
                    invoice_status isi,
                    invoice_items ii
                where
                    i.invoice_status_id = isi.id and
                    ii.invoices_id = i.id and
                    i.office_id = %s
                group by
                    i.id
                order by 
                    i.created
                limit 1
                """,(x['office_id'],)
            )
            x['invoice'] = {}
            for j in t:
                if j['id'] is None:
                    continue
                x['invoice'] = j
                x['invoice']['items'] = json.loads(x['invoice']['items'])
            k.append(x)
        ret['config'] = {}
        ret['config']['status'] = db.query("select id,name from provider_queue_status")
        ret['config']['strength'] = db.query("select id,name from provider_queue_lead_strength")
        ret['registrations'] = k
        return ret

class TrafficGet(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        today = calcdate.getYearToday()
        if 'date' in params:
            if params['date'] == 'All':
                del params['date']
        if 'zipcode' in params:
            if params['zipcode'] == 'All':
                del params['zipcode']
            if params['zipcode'] is None:
                del params['zipcode']
        STR = self.getLeadStrength()
        db = Query()
        l = db.query("""
            select count(id) as cnt,date(ti.created) as day 
                from traffic_incidents ti group by date(created) order by date(created) desc
            """)
        ret['config'] = {}
        ret['config']['avail'] = l
        ret['config']['avail'].insert(0,{'id':0,'day':'All'})
        l = db.query("""
            select count(id) as cnt,zipcode as zipcode 
            from traffic_incidents 
            group by zipcode order by zipcode desc
            """)
        ret['config']['locations'] = l
        ret['config']['locations'].insert(0,{'id':0,'zipcode':'All'})
        # Temporary - Just get accidents
        l = db.query("""
            select id,name from traffic_categories where category_id = 1
            UNION ALL
            select 99,'Location'
            UNION ALL
            select 101,'Potential Providers'
            """)
        ret['config']['categories'] = l
        if 'categories' not in params or len(params['categories']) == 0:
            return ret
        #Incase we need to do time offsets
        #l = db.query("""
        #    select code1 from position_zip where zipcode = %s
        #    """,(params['zipcode'],)
        #)
        #state = l[0]['code1']
        #l = db.query("""
        #    select offset from traffic_cities tc, timezones t 
        #    where 
        #        tc.state = %s and
        #        t.id = tc.tz
        #    """,(state,)
        #)
        #offset = l[0]['offset']
        sqlp = []
        q = """
            select
                ti.lat as lat ,ti.lon as lng
            from
                traffic_incidents ti,
                traffic_coordinates tc
            where
                1 = 1 and
                tc.traffic_incidents_id = ti.id and 
        """
        if 'date' in params:
            q += " date(ti.created) = %s and "
            sqlp.append(params['date'])
        q += """
                1 = 1
            limit 1
        """
        l = db.query(q,sqlp)
        if len(l) > 0:
            if 'zipcode' in params:
                o = db.query("""
                    select lat,lon as lng from 
                    position_zip where zipcode=%s
                    UNION ALL
                    select lat,lon as lng from 
                    position_zip where zipcode=77089
                    """,(params['zipcode'],)
                )
                if len(o) > 0:
                    ret['center'] = {'lat':o[0]['lat'],'lng':o[0]['lng']}
                else:
                    ret['center'] = {'lat':l[0]['lat'],'lng':l[0]['lng']}
            else:
                ret['center'] = {'lat':l[0]['lat'],'lng':l[0]['lng']}
        else:
            ret['center'] = {'lat':0,'lng':0}
        q = """
            select
                ti.uuid,ti.traffic_categories_id as category_id,
                tcat.name as category,ti.zipcode,ti.city,ti.traf_start_time,
                ti.traf_end_time,ti.traf_num_reports,ti.lat,ti.lon as lng,
                ti.traf_magnitude,ti.traf_delay,ti.state,
                json_arrayagg(
                    json_object(
                        'lat',tc.lat,
                        'lng',tc.lon,
                        'ord',tc.ord
                    )
                ) as coords
            from
                traffic_incidents ti,
                traffic_coordinates tc,
                traffic_categories tcat
            where
                1 = 1 and
                tc.traffic_incidents_id = ti.id and
                ti.traffic_categories_id = tcat.id and
        """
        sqlp = []
        if 'date' in params:
            q += " date(ti.created) = %s and "
            sqlp.append(params['date'])
        #if 'zipcode' in params:
        #    q += " ti.zipcode = %s and "
        #    sqlp.append(params['zipcode'])
        if 'categories' in params:
            q += " ti.traffic_categories_id in (%s) and " 
            sqlp.append(",".join(map(str,params['categories'])))
        q += """
            1 = 1
            group by
                ti.id
            order by
                tc.ord
        """
        l = db.query(q,sqlp)
        ret['data'] = []
        for x in l:
            x['coords'] = json.loads(x['coords'])
            ret['data'].append(x)
        zipcoords = {}
        if 'zipcode' in params:
            ret['data'].append({
                'category_id':100,
                'coords':[ret['center']]
            })
            zipcoords = ret['center']
        if 101 in params['categories'] and 'zipcode' in params:
            o = db.query("""
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) as miles,
                    oa.city,oa.state,oa.zipcode,99 as category_id,
                    pq.provider_queue_lead_strength_id as lead_strength_id,
                    pqls.name as lead_strength,
                    'Location' as category, oa.lat, oa.lon as lng,
                    json_arrayagg(
                        json_object('lat',oa.lat,'lng',oa.lon)) as coords
                from 
                    office_addresses oa,
                    provider_queue_lead_strength pqls,
                    provider_queue pq
                where
                    lat <> 0 and
                    pq.provider_queue_lead_strength_id = %s and
                    round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) < 50 and
                    pq.provider_queue_lead_strength_id = pqls.id and
                    pq.office_id = oa.office_id
                group by 
                    oa.id
                """,(zipcoords['lng'],
                     zipcoords['lat'],STR['Potential Provider'],
                     zipcoords['lng'],zipcoords['lat'])
            )
            for t in o:
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        if 99 in params['categories']:
            o = db.query("""
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    oa.city,oa.state,oa.zipcode,99 as category_id,
                    pq.provider_queue_lead_strength_id as lead_strength_id,
                    pqls.name as lead_strength,
                    'Location' as category, oa.lat, oa.lon as lng,
                    json_arrayagg(
                        json_object('lat',oa.lat,'lng',oa.lon)) as coords
                from 
                    office_addresses oa,
                    provider_queue_lead_strength pqls,
                    provider_queue pq
                where
                    lat <> 0 and
                    pq.provider_queue_lead_strength_id <> %s and
                    pq.provider_queue_lead_strength_id = pqls.id and
                    pq.office_id = oa.office_id
                group by 
                    oa.id
                """,(STR['Potential Provider'],)
            )
            for t in o:
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        return ret



