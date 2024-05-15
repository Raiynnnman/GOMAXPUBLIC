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
from util.Permissions import check_admin,check_bdr
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

    def getWebsiteTraffic(self):
        db= Query()
        o = db.query("""
            select
                ifnull(t1.num1,0) as num1, /* */
                ifnull(t2.num2,0) as num2, /* */
                ifnull(t3.num3,0) as num3, /* */
                ifnull(t4.num4,0) as num4
            from
                (select count(id) as num1 from performance where created > date(now())) as t1,
                (select round(avg(ms),3) as num2 from performance where created > date(now())) as t2,
                (select round(max(ms),3) as num3 from performance where created > date(now())) as t3,
                (select round(min(ms),3) as num4 from performance where created > date(now())) as t4
        """)
        return o[0]
        
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
                    cio.client_intake_id=ci.id and hidden = 0
                    ) as t1,
                (select count(ci.id) as num2 from 
                    client_intake_offices cio,client_intake ci
                    where 
                        cio.client_intake_id=ci.id and and hidden=0 and
                        month(ci.created) = month(now())
                        and year(ci.created) = year(now())) as t2,
                (select count(ci.id) as num3 from 
                    client_intake_offices cio,client_intake ci
                    where 
                    cio.client_intake_id=ci.id and hidden=0 and 
                    year(ci.created) = year(now())) as t3,
                (select count(ci.id) as num4 from client_intake_offices cio,
                    client_intake ci
                    where 
                    cio.client_intake_id=ci.id and hidden=0 and
                    and client_intake_status_id=%s) as t4
            """,(CI['COMPLETED'],))
        return o[0]

    def getTrafficStats(self): 
        db= Query()
        o = db.query("""
            select
                ifnull(t1.num1,0) as num1, /* */
                ifnull(t2.num2,0) as num2, /* */
                ifnull(t3.num3,0) as num3, /* */
                ifnull(t4.num4,0) as num4
            from
                (select count(id) as num1 from 
                    traffic_incidents 
                    where traffic_categories_id = 2
                    ) as t1,
                (select count(id) as num2 from 
                    traffic_incidents
                    where 
                        traffic_categories_id = 2
                        and  created > date(now())) as t2,
                (select count(id) as num3 from 
                    traffic_incidents
                    where 
                        month(created) = month(now()) 
                        and traffic_categories_id = 2
                        and year(created) = year(now())) as t3,
                (select count(id) as num4 from 
                    traffic_incidents
                    where 
                        traffic_categories_id = 2
                        and year(created) = year(now())) as t4
            """
        )
        return o[0]


    def getLeadsStatus(self):
        db= Query()
        ST = self.getLeadStrength()
        o = db.query("""
            select
                ifnull(t1.num1,0) as num1, /* */
                ifnull(t2.num2,0) as num2, /* */
                ifnull(t3.num3,0) as num3, /* */
                ifnull(t4.num4,0) as num4
            from
                (select count(id) as num1 from 
                    provider_queue pq
                    ) as t1,
                (select count(id) as num2 from 
                    provider_queue
                    where 
                        provider_queue_lead_strength_id = %s 
                        and year(created) = year(now())) as t2,
                (select count(id) as num3 from 
                    provider_queue
                    where 
                        provider_queue_lead_strength_id = %s 
                        and year(created) = year(now())) as t3,
                (select count(id) as num4 from 
                    provider_queue 
                    where 
                        provider_queue_lead_strength_id = %s 
                        and year(created) = year(now())) as t4
            """,(ST['Preferred Provider'],
                 ST['In-Network Provider'],ST['Potential Provider'])
        )
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
                (select count(id) as num4 from client_intake where hidden=0 and created > date(now())) as t4
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

    def getCommissionsThisMonth(self,u):
        db = Query()
        PQS = self.getProviderQueueStatus()
        OT = self.getOfficeTypes()
        o = []
        if 'CommissionAdmin' in u['entitlements']:
            o = db.query("""
                select 
                    ifnull(t1.num1,0) as num1, /* commissions */
                    ifnull(t2.num2,0) as num2, /* Total paid */
                    ifnull(t3.num3,0) as num3, /* sent */
                    ifnull(t4.num4,0) as num4 /* Voided */
                from 
                    (select round(sum(amount),2) as num1 from commission_users a
                        where 
                        a.created > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                    (select round(sum(total),2) as num2 from invoices a
                        where 
                        a.invoice_status_id = 15 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                    (select round(sum(total),2) as num3 from invoices a
                        where 
                        a.invoice_status_id = 10 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                    (select round(sum(total),2) as num4 from invoices a
                        where 
                        a.invoice_status_id = 25 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
                """
            )
        else:
            o = db.query("""
                select 
                    ifnull(t1.num1,0) as num1, /* commissions */
                    ifnull(t2.num2,0) as num2, /* Total paid */
                    ifnull(t3.num3,0) as num3, /* sent */
                    ifnull(t4.num4,0) as num4 /* Voided */
                from 
                    (select round(sum(amount),2) as num1 from commission_users a
                        where 
                        a.user_id = %s and a.created > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                    (select round(sum(total),2) as num2 from invoices a,commission_users com
                        where 
                        a.id = com.invoices_id and com.user_id = %s and a.invoice_status_id = 15 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                    (select round(sum(total),2) as num3 from invoices a,commission_users com
                        where 
                        a.id = com.invoices_id and com.user_id = %s and a.invoice_status_id = 10 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                    (select round(sum(total),2) as num4 from invoices a,commission_users com
                        where 
                        a.id = com.invoices_id and com.user_id = %s and a.invoice_status_id = 25 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
                """,(u['id'],u['id'],u['id'],u['id'])
            )
        return o[0]

    def getRevenueThisMonth(self):
        db = Query()
        PQS = self.getProviderQueueStatus()
        OT = self.getOfficeTypes()
        o = db.query("""
            select 
                ifnull(t1.num1,0) as num1, /* our revenue */
                ifnull(t2.num2,0) as num2, /* revenue */
                ifnull(t3.num3,0) as num3, /* count bundles */
                ifnull(t4.num4,0) as num4
            from 
                (select round(sum(total),2) as num1 from invoices a
                    where 
                    a.billing_period > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                (select round(sum(total),2) as num2 from invoices a
                    where 
                    a.invoice_status_id = 15 
                    and a.billing_period > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                (select round(sum(total),2) as num3 from invoices a
                    where 
                    a.invoice_status_id = 10 
                    and a.billing_period > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                (select round(sum(total),2) as num4 from invoices a
                    where 
                    a.invoice_status_id = 25 
                    and a.billing_period > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
            """
        )
        return o[0]

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        u = args[1][0]
        ret['visits'] = self.getVisits()
        ret['commissions'] = self.getCommissionsThisMonth(u)
        ret['revenue_month'] = self.getRevenueThisMonth()
        ret['revenue_leads_month'] = self.getLeadsRevenueMonth()
        ret['lead_status'] = self.getLeadsStatus()
        ret['traffic'] = self.getTrafficStats()
        ret['website_stats'] = self.getWebsiteTraffic()
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
                order by created desc
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
                upfront_cost,
                start_date,end_date,active,created,updated
            from
                pricing_data 
            order by
                description asc
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
                    ) as addr,u.phone,u.first_name,u.last_name,o.stripe_cust_id,o.old_stripe_cust_id,
                    ot.name as office_type,o.updated,o.commission_user_id,
                    concat(comu.first_name, ' ', comu.last_name) as commission_name
                from 
                    office o
                    left outer join office_addresses oa on oa.office_id=o.id
                    left outer join office_type ot on o.office_type_id = ot.id
                    left outer join provider_queue pq on pq.office_id = o.id
                    left outer join provider_queue_status pqs on pq.provider_queue_status_id=pqs.id
                    left outer join users comu on comu.id = o.commission_user_id
                    left join  users u on u.id = o.user_id
                where 
                    o.office_type_id <> %s and
                    o.office_type_id <> %s 
            """ % (OT['Customer'],OT['Legal'])
        stat_params = []
        count_par = []
        search_par = [
            int(limit),
            int(offset)*int(limit)
        ]
        if 'office_id' in params and params['office_id'] is not None and int(params['office_id']) > 0:
            q += " and o.id = %s " % params['office_id']
        elif 'search' in params and params['search'] is not None:
            q += """ and (o.email like %s  or o.name like %s or oa.phone like %s ) 
            """
            search_par.insert(0,params['search']+'%%')
            search_par.insert(0,params['search']+'%%')
            search_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
        elif 'status' in params and params['status'] is not None:
            q += " and pq.provider_queue_status_id in (%s) " % ','.join(map(str,params['status']))
        q += " group by o.id order by o.updated desc "
        cnt = db.query("select count(id) as cnt from (" + q + ") as t", count_par)
        q += " limit %s offset %s " 
        ret['total'] = cnt[0]['cnt']
        o = db.query(q,search_par)
        ret['offices'] = []
        for x in o:
            x['comments'] = []
            comms = db.query("""
                select 
                    ic.id,ic.text,ic.user_id,
                    u.first_name,u.last_name,u.title,
                    ic.created
                from 
                office_comment ic, users u
                where ic.user_id = u.id and office_id=%s
                order by created desc
                """,(x['id'],)
            )
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
                    """,(x['id'],)
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
            x['last_comment'] = ''
            x['cards'] = db.query("""
                select id,card_id,last4,exp_month,exp_year,is_default,brand
                from office_cards where office_id=%s
                """,(x['id'],)
            )
            x['clients'] = db.query("""
                select
                    u.first_name,u.last_name,u.phone,u.email,ci.created 
                from
                    client_intake ci, client_intake_offices cio,users u
                where 
                    ci.user_id = u.id and
                    ci.id = cio.client_intake_id and
                    cio.office_id = %s
                """,(x['id'],)
            )
            x['history'] = db.query("""
                select ph.id,user_id,text,concat(u.first_name, ' ', u.last_name) as user,ph.created
                    from office_history ph,users u
                where 
                    ph.user_id=u.id and
                    ph.office_id = %s
                order by created desc
                """,(x['id'],)
            )
            x['addr'] = json.loads(x['addr'])
            x['potential'] = db.query("""
                select
                    name,places_id,addr1,phone,city,state,
                    zipcode,score,lat,lon,website,google_url,
                    rating,updated
                from 
                    office_potential_places
                where office_id = %s
                """,(x['id'],)
            )
            x['next_invoice'] = db.query("""
                select date_add(max(billing_period),INTERVAL 1 MONTH) as next_invoice
                from invoices where office_id = %s group by office_id
                """,(x['id'],)
            )
            if len(x['next_invoice']) > 0:
                x['next_invoice'] = x['next_invoice'][0]['next_invoice']
            else:
                x['next_invoice'] = None
            t = db.query("""
                select 
                    i.id,i.invoice_status_id,isi.name as status,i.total,i.billing_period,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',ii.id,'price',ii.price,
                            'description',ii.description,'quantity',ii.quantity
                        )
                    ) as items,i.stripe_invoice_id,sis.status as stripe_status,i.office_id
                
                from
                    invoices i,
                    invoice_status isi,
                    stripe_invoice_status sis,
                    invoice_items ii
                where
                    i.invoice_status_id = isi.id and
                    sis.invoices_id = i.id and
                    ii.invoices_id = i.id and
                    month(billing_period) <= month(now()) and
                    year(billing_period) <= year(now()) and
                    i.office_id = %s
                group by
                    i.id
                order by 
                    billing_period desc
                """,(x['id'],)
            )
            x['invoices'] = []
            for j in t:
                if j['id'] is None:
                    continue
                j['items'] = json.loads(j['items'])
                x['invoices'].append(j)
                x['service_start_date'] = j['billing_period']
            t = db.query("""
                select 
                    op.id,start_date,end_date,coupons_id,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',opi.id,'price',opi.price,'description',
                            opi.description,'quantity',opi.quantity
                        )
                    ) as items,round(datediff(end_date,now())/30,0) as months_left
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
        ret['config']['commission_users'] = db.query("""
            select id,concat(first_name,' ',last_name) as name from users 
                where id in (select user_id from user_entitlements where entitlements_id=10)
        """)
        ret['config']['coupons'] = db.query("select id,name,total,perc,reduction from coupons")
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
            db.update("insert into office (name,office_type_id,email,billing_system_id) values (%s,%s,%s,%s,%s)",
                (params['name'],OT['Provider'],params['email'],BS)
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,%s,'Created (New)'
                )
            """,(insid,user['id']))
        else:
            db.update("""
                update office set
                    name = %s, 
                    email = %s, 
                    active = %s
                    where id = %s
                """,(params['name'],params['email'],params['active'],params['id']))
            insid = params['id']
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,%s,'Updated Record'
                )
            """,(insid,user['id']))
        if 'commission_user_id' in params:
            db.update("""
                update office set commission_user_id=%s where id = %s
                """,(params['commission_user_id'],insid)
            )
        if 'comments' in params:
            for x in params['comments']:
                if 'id' in x:
                    continue
                bb2 = encryption.encrypt(
                    x['text'],
                    config.getKey('encryption_key')
                    )
                db.update("""
                    insert into office_comment (user_id,office_id,text)
                    values 
                    (%s,%s,%s)
                    """,(user['user_id'],params['id'],bb2)
                )
                db.update("""
                    insert into office_history (office_id,user_id,text) values
                        (%s,%s,%s)""",(params['id'],user['id'],"ADDED_COMMENT")
                )
            db.commit()
        db.update("""
            delete from office_providers where office_addresses_id in
                (select id from office_addresses where office_id=%s)
            """,(insid,)
        )
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
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,%s,'Updated Record'
            )
        """,(params['id'],user['id']))
        db.commit()
        return {'success': True}

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
        invid = 0
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
                provider_queue pq
                left outer join provider_queue_status pqs on  pq.provider_queue_status_id = pqs.id
                left outer join office o on pq.office_id = o.id
                left outer join office_addresses oa on oa.office_id = o.id
                left outer join office_plans op on op.office_id = o.id
                left outer join office_user ou on ou.office_id = o.id
                left outer join users u on u.id = ou.user_id
            where
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
            if 'office_type_id' not in params:
                params['office_type_id'] = OT['Chiropractor']
            db.update("""
                insert into office(
                        name,office_type_id,email,user_id,billing_system_id
                    ) values
                    (%s,%s,%s,%s,%s)
                """,
                (
                params['name'],params['office_type_id'],params['email'],userid,BS
                )
            )
            offid = db.query("select LAST_INSERT_ID()");
            offid = offid[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,%s,'Created (New Record)'
                )
            """,(offid,user['id']))
            db.update("""
                insert into provider_queue(office_id,provider_queue_lead_strength_id) values (%s,%s)
                """,(offid,STR['Potential Provider'])
            )
            pqid = db.query("select LAST_INSERT_ID()");
            pqid = pqid[0]['LAST_INSERT_ID()']
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,%s,'Created (New Record)'
                )
            """,(pqid,user['id']))
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
                insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
                """,(userid,ENT['OfficeAdmin'])
            )
            db.update("""
                insert into user_permissions (user_id,permissions_id) values (%s,%s)
                """,(userid,PERM['Admin'])
            )
            selplan = 0 
            planid = 0
            if 'pricing_id' in params and params['pricing_id'] is not None and params['pricing_id'] > 0:
                selplan = int(params['pricing_id'])
                db.update("""
                    insert into office_plans (office_id,start_date,end_date,pricing_data_id) 
                        values (%s,now(),date_add(now(),INTERVAL %s MONTH),%s)
                    """,(offid,PL[selplan]['duration'],selplan)
                )
                planid = db.query("select LAST_INSERT_ID()");
                planid = planid[0]['LAST_INSERT_ID()']
                db.update("""
                    insert into office_history(office_id,user_id,text) values (
                        %s,%s,'Created Plan'
                    )
                """,(offid,user['id']))
        else:
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,%s,'Updated Record'
                )
            """,(pqid,user['id']))
            
        db.update("""
            update office set 
                email = %s
            where
            id = %s
            """,(
                params['email'].lower(),
                offid
                )
        )
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
        if 'lead_strength_id' not in params:
            params['lead_strength_id'] = STR['Potential Provider']
        if 'initial_payment' not in params:
            params['initial_payment'] = None
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
        if 'commission_user_id' in params:
            db.update("""
                update office set commission_user_id=%s where id=%s
                """,(params['commission_user_id'],offid)
            )
        if 'pricing_id' in params and params['pricing_id'] is not None and params['pricing_id'] > 0:
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
            if 'coupon_id' in params and params['coupon_id'] is not None:
                db.update("""update office_plans set coupons_id = %s
                    where id = %s
                    """,(params['coupon_id'],planid)
                )
                coup = db.query("""
                    select total,perc,reduction,name from coupons where id = %s
                    """,(params['coupon_id'],)
                )
                if len(coup) > 0:
                    coup = coup[0]
                    val = 0
                    if coup['total'] is not None:
                        val = PL[selplan]['upfront_cost'] * PL[selplan]['duration']
                        val = val - coup['total']
                    if coup['perc'] is not None:
                        val = PL[selplan]['upfront_cost'] * PL[selplan]['duration']
                        val = val * coup['perc']
                    if coup['reduction'] is not None:
                        val = PL[selplan]['upfront_cost'] * PL[selplan]['duration']
                        val = coup['reduction']
                    db.update("""
                        insert into office_plan_items (
                            office_plans_id,price,quantity,description) 
                        values 
                            (%s,%s,%s,%s)
                        """,(planid,-val,1,coup['name'])
                            
                    )
        db.update("""
            delete from office_providers where office_addresses_id in
                (select id from office_addresses where office_id=%s)
            """,(offid,)
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
            if params['initial_payment'] is None:
                params['initial_payment'] = 0
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
                    sum += float(y['price']) * float(y['quantity'])
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
        self.setJenkinsID(offid)
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
        if 'search' in params:
            if params['search'] == None or len(params['search']) == 0:
                del params['search']
        db = Query()
        PQS = self.getProviderQueueStatus()
        q = """
            select 
                pq.id,o.name,o.email,o.id as office_id,pqs.name as status,
                pq.provider_queue_status_id,pq.sm_id,pqls.name as lead_strength,
                pqls.id as lead_strength_id, pq.created,pq.updated,pq.places_id,
                pq.initial_payment,ot.id as office_type_id,
                ot.name as office_type,op.pricing_data_id as pricing_id,
                o.commission_user_id,oa.state,op.start_date,
                concat(comu.first_name, ' ', comu.last_name) as commission_name,
                coup.id as coupon_id,coup.name as coupon_name
            from
                provider_queue pq
                left join office o on pq.office_id = o.id
                left join office_addresses oa on oa.office_id = o.id 
                left outer join provider_queue_status pqs on pqs.id=pq.provider_queue_status_id
                left outer join provider_queue_lead_strength pqls on pq.provider_queue_lead_strength_id=pqls.id
                left outer join office_plans op on op.office_id = o.id
                left outer join coupons coup on coup.id = op.coupons_id
                left outer join office_type ot on ot.id=o.office_type_id
                left outer join users comu on comu.id = o.commission_user_id
            where
                1 = 1 
        """
        status_ids = []
        search_par = [
            int(limit),
            int(offset)*int(limit)
        ]
        ret['sort'] = [
            {'id':1,'col':'updated','active':False,'direction':'asc'},
            {'id':2,'col':'name','active':False,'direction':'asc'}
        ]
        count_par = []
        if 'pq_id' in params and params['pq_id'] is not None and params['pq_id'] > 0:
            q += " and pq.id = %s "
            search_par.insert(0,int(params['pq_id']))
            count_par.append(int(params['pq_id']))
        elif 'status' in params and len(params['status']) > 0:
            q += " and provider_queue_status_id in ("
            arr = []
            for z in params['status']:
                arr.append(z)
            q += ",".join(map(str,arr))
            q += ")"
        if 'search' in params:
            if 'state:' in params['search'].lower():
                q += """ and oa.state = %s """
                y = params['search'].split(":")
                y = y[1]
                t = y.rstrip().lstrip()
                search_par.insert(0,t)
                count_par.insert(0,t)
            elif 'created:' in params['search'].lower():
                y = params['search'].split(":")
                y = y[1]
                t = y.rstrip().lstrip()
                if len(t) == 10:
                    q += """ and pq.created = %s """
                    search_par.insert(0,t)
                    count_par.insert(0,t)
            elif 'id:' in params['search'].lower():
                q += """ and pq.id = %s """
                y = params['search'].split(":")
                y = y[1]
                t = y.rstrip().lstrip()
                search_par.insert(0,t)
                count_par.insert(0,t)
            else:
                q += """ and (o.email like %s  or o.name like %s) 
                """
                search_par.insert(0,params['search']+'%%')
                search_par.insert(0,params['search']+'%%')
                count_par.insert(0,params['search']+'%%')
                count_par.insert(0,params['search']+'%%')
        if 'type' in params and params['type'] is not None:
            q += " and office_type_id in ("
            arr = []
            for z in params['type']:
                arr.append(z)
            q += ",".join(map(str,arr))
            q += ")"
        cnt = db.query("select count(id) as cnt from (" + q + ") as t", count_par)
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
        o = []
        o = db.query(q,search_par)
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
            x['history'] = db.query("""
                select ph.id,user_id,text,concat(u.first_name, ' ', u.last_name) as user,ph.created
                    from provider_queue_history ph,users u
                where 
                    ph.user_id=u.id and
                    ph.provider_queue_id = %s
                order by created desc
                """,(x['id'],)
            )
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
                    i.billing_period,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',ii.id,'price',ii.price,
                            'description',ii.description,'quantity',ii.quantity
                        )
                    ) as items
                
                from
                    invoices i,
                    invoice_status isi,
                    office_plans op,
                    invoice_items ii
                where
                    i.invoice_status_id = isi.id and
                    i.office_id = op.office_id and
                    ii.invoices_id = i.id and
                    month(i.billing_period) = month(op.start_date) and
                    year(i.billing_period) = year(op.start_date) and
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
        ret['config']['type'] = db.query("select id,name from office_type where name <> 'Customer'")
        ret['config']['status'] = db.query("select id,name from provider_queue_status")
        ret['config']['coupons'] = db.query("select id,name,total,perc,reduction from coupons")
        ret['config']['commission_users'] = db.query("""
            select 1 as id,'System' as name
            UNION ALL
            select id,concat(first_name,' ',last_name) as name from users 
                where id in (select user_id from user_entitlements where entitlements_id=10)
        """)
        ret['config']['strength'] = db.query("select id,name from provider_queue_lead_strength")
        ret['registrations'] = k
        if 'report' in params and params['report'] is not None:
            ret['filename'] = 'provider_report.csv'
            frame = pd.DataFrame.from_dict(ret['registrations'])
            t = frame.to_csv()
            ret['content'] = base64.b64encode(t.encode('utf-8')).decode('utf-8')
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
            select 99,'Preferred Providers'
            UNION ALL
            select 101,'Potential Providers'
            UNION ALL
            select 102,'Customers'
            UNION ALL
            select 103,'No Results'
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
                w = int(len(l)/2)
                ret['center'] = {'lat':l[w]['lat'],'lng':l[w]['lng']}
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
                created > date_add(created,INTERVAL -60 DAY) and
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
        if False and 102 in params['categories'] and 'zipcode' in params:
            o = db.query("""
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) as miles,
                    oa.city,oa.state,oa.zipcode,99 as category_id,pq.website,
                    'Potential Provider' as category, oa.lat, oa.lon as lng,
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
                     zipcoords['lat'],
                     zipcoords['lng'],zipcoords['lat'])
            )
            for t in o:
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        if 101 in params['categories'] and 'zipcode' in params:
            o = db.query("""
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) as miles,
                    oa.city,oa.state,oa.zipcode,99 as category_id,
                    'Potential Provider' as category, oa.lat, oa.lon as lng,
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
        if 103 in params['categories']:
            o = db.query("""
                select 103 as category_id,'No Result' as category,
                  count(sha) as count, sha as uuid,lat as lat,lon as lng,
                  json_object('lat',lat,'lng',lon) as coords,0 as zipcode
                from 
                    search_no_results
                group by sha
                """)
            for t in o:
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        ## -- HeatMap
        TC = self.getTrafficCategories()
        o = db.query("""
            select 104 as category_id,'HeatMap' as category,
                ti.zipcode,count(ti.zipcode) as weight2,uuid() as uuid,
                pz.lat as lat,pz.lon as lng,
                json_object('lat',pz.lat,'lng',pz.lon) as coords 
            from 
                traffic_incidents ti,position_zip pz 
            where 
                pz.zipcode=ti.zipcode and 
                ti.traffic_categories_id=%s 
            group by zipcode
            """,(TC['Accident'],)
        )
        ret['heatmap'] = []
        for t in o:
            t['coords'] = json.loads(t['coords'])
            ret['heatmap'].append(t) 
        if 99 in params['categories']:
            o = db.query("""
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    oa.city,oa.state,oa.zipcode,99 as category_id,
                    oa.phone,oa.office_id,
                    pq.provider_queue_lead_strength_id as lead_strength_id,
                    pqls.name as lead_strength,
                    'Preferred Provider' as category, oa.lat, oa.lon as lng,
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
                t['providers'] = db.query("""
                    select u.id,u.first_name,u.last_name,u.email,u.phone 
                        from office_user ou,users u
                    where ou.user_id=u.id and ou.office_id=%s
                    """,(t['office_id'],)
                )
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        return ret

class AdminReportGet(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def OfficeReport(self):
        q = """
            select
                o.id,o.name,o.email,i.id as invoice_id,
                pd.description as subscription_plan,
                pd.duration as subscription_duration,
                op.start_date as plan_start,
                op.end_date as plan_end,
                i1.name as first_invoice_status, i1.bp as  first_billing_period,
                i1.total as first_invoice_total,
                i2.name as last_invoice_status, i2.bp as  last_billing_period,
                i2.total as last_invoice_total, 
                date_add(max(i.billing_period),INTERVAL 1 MONTH) as next_invoice
            from
                office o
                left outer join invoices i on i.office_id=o.id
                left outer join office_plans op on op.office_id = o.id
                left outer join pricing_data pd on op.pricing_data_id = pd.id
                left outer join (
                    select i.office_id,i.total,i.id,isi.name,min(i.billing_period) as bp
                        from invoices i,invoice_status isi where 
                        isi.id=i.invoice_status_id group by office_id
                        order by min(i.billing_period)
                ) i1 on i1.office_id = o.id
                left outer join (
                    select i.office_id,i.total,i.id,isi.name,max(i.billing_period) as bp
                        from invoices i,invoice_status isi where 
                        isi.id=i.invoice_status_id group by office_id
                        order by max(i.billing_period) desc
                ) i2 on i2.office_id = o.id
            where
                o.active = 1 and
                o.office_type_id=1 
            group by
                o.id
            """
        db = Query()
        o = db.query(q)
        ret = pd.DataFrame.from_dict(o)
        return ret

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        frame = []
        report = 'report.csv'
        if 'report' in params:
            if params['report'] == 'office_report':
                frame = self.OfficeReport()
                report = 'office_status_report.csv'
        ret['filename'] = report
        t = frame.to_csv()
        ret['content'] = base64.b64encode(t.encode('utf-8')).decode('utf-8')
        return ret

class AdminBookingRegister(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
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
        user_id = 0
        l = db.query("select id from users where email = %s",(params['email'].lower(),))
        for x in l:
            user_id = x['id']
        if user_id == 0:
            n = params['name'].split(' ')
            f = n[0] 
            l = ''
            if len(n) > 1:
                l = n[1] 
            db.update("""
                insert into users (email, first_name, last_name, phone ) values (%s,%s,%s,%s)
                """,(params['email'],f,l,params['phone'])
            )
            user_id = db.query("select LAST_INSERT_ID()");
            user_id = user_id[0]['LAST_INSERT_ID()']
            db.update("""
                insert into user_addresses (user_id,addr1,city,state,places_id,fulladdr)
                    values (%s,%s,%s,%s,%s,%s)
                """,(
                    user_id,
                    params['address']['addr1'],
                    params['address']['city'],
                    params['address']['state'],
                    params['address']['places_id'],
                    params['address']['fulladdr']
                    )
            )
        if 'id' in params:
            # Update here
            pass
        else:
            fields = [
                'user_id'
            ]
            values = [
                user_id
            ]
            for x in inputs:
                fields.append(x['f'])
                if x['f'] not in params:
                    params[x['f']] = ''
                values.append(params[x['f']])
            q = 'insert into client_intake (' + ','.join(fields) + ') values ('
            for n in range(len(fields)):
                q += '%s,'
            q = q[:len(q)-1]
            q += ' ) '
            db.update(q,values)
            ci_id = db.query("select LAST_INSERT_ID()");
            ci_id = ci_id[0]['LAST_INSERT_ID()']
            db.update("""
                insert into client_intake_offices (client_intake_id,office_id,phy_id) 
                    values(%s,%s,%s)
                """,(ci_id,params['office_id'],params['phy_id'])
            )
        db.commit()
        return ret

class ReferrerList(AdminBase):

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
        if 'search' in params:
            if params['search'] == None or len(params['search']) == 0:
                del params['search']
        db = Query()
        ret['config'] = {}
        ret['config']['status'] = db.query("select id,name from referrer_users_status")
        q = """
            select 
                ru.id,ru.email,ru.name,ru.phone,o.name as office_name,ru.referred,
                ru.referrer_users_status_id, rs.name as status,ru.zipcode,
                ru.updated,o.id as office_id, ro.name as referrer_name
            from 
                referrer_users ru
                left join referrer_users_status rs on ru.referrer_users_status_id=rs.id
                left join office ro on ru.referrer_id=ro.id
                left outer join office o on o.id = ru.office_id
            """
        p = []
        if 'status' in params:
            q += " and ("
            arr = []
            for z in params['status']:
                arr.append("referrer_users_status_id = %s " % z)
            q += " or ".join(arr)
            q += ")"
        p.append(limit)
        p.append(offset*limit)
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,))
        ret['total'] = cnt[0]['cnt']
        q += " limit %s offset %s " 
        o = db.query(q,p)
        ret['data'] = o
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
                    ) as addr,u.phone,u.first_name,u.last_name,o.stripe_cust_id,o.old_stripe_cust_id,
                    ot.name as office_type,o.updated,o.commission_user_id,
                    concat(comu.first_name, ' ', comu.last_name) as commission_name
                from 
                    office o
                    left outer join office_addresses oa on oa.office_id=o.id
                    left outer join office_type ot on o.office_type_id = ot.id
                    left outer join provider_queue pq on pq.office_id = o.id
                    left outer join provider_queue_status pqs on pq.provider_queue_status_id=pqs.id
                    left outer join users comu on comu.id = o.commission_user_id
                    left join  users u on u.id = o.user_id
                where 
                    o.office_type_id = %s 
            """ % (OT['Legal'],)
        stat_params = []
        count_par = []
        search_par = [
            int(limit),
            int(offset)*int(limit)
        ]
        if 'office_id' in params and params['office_id'] is not None and int(params['office_id']) > 0:
            q += " and o.id = %s " % params['office_id']
        elif 'search' in params and params['search'] is not None:
            q += """ and (o.email like %s  or o.name like %s or oa.phone like %s ) 
            """
            search_par.insert(0,params['search']+'%%')
            search_par.insert(0,params['search']+'%%')
            search_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
        elif 'status' in params and params['status'] is not None:
            q += " and pq.provider_queue_status_id in (%s) " % ','.join(map(str,params['status']))
        q += " group by o.id order by o.updated desc "
        cnt = db.query("select count(id) as cnt from (" + q + ") as t", count_par)
        q += " limit %s offset %s " 
        ret['total'] = cnt[0]['cnt']
        o = db.query(q,search_par)
        ret['legal'] = []
        for x in o:
            x['history'] = db.query("""
                select ph.id,user_id,text,concat(u.first_name, ' ', u.last_name) as user,ph.created
                    from office_history ph,users u
                where 
                    ph.user_id=u.id and
                    ph.office_id = %s
                order by created desc
                """,(x['id'],)
            )
            x['addr'] = json.loads(x['addr'])
            x['potential'] = db.query("""
                select
                    name,places_id,addr1,phone,city,state,
                    zipcode,score,lat,lon,website,google_url,
                    rating,updated
                from 
                    office_potential_places
                where office_id = %s
                """,(x['id'],)
            )
            x['next_invoice'] = db.query("""
                select date_add(max(billing_period),INTERVAL 1 MONTH) as next_invoice
                from invoices where office_id = %s group by office_id
                """,(x['id'],)
            )
            if len(x['next_invoice']) > 0:
                x['next_invoice'] = x['next_invoice'][0]['next_invoice']
            else:
                x['next_invoice'] = None
            t = db.query("""
                select 
                    i.id,i.invoice_status_id,isi.name as status,i.total,i.billing_period,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',ii.id,'price',ii.price,
                            'description',ii.description,'quantity',ii.quantity
                        )
                    ) as items,i.stripe_invoice_id,sis.status as stripe_status 
                
                from
                    invoices i,
                    invoice_status isi,
                    stripe_invoice_status sis,
                    invoice_items ii
                where
                    i.invoice_status_id = isi.id and
                    sis.invoices_id = i.id and
                    ii.invoices_id = i.id and
                    i.office_id = %s
                group by
                    i.id
                order by 
                    billing_period desc
                """,(x['id'],)
            )
            x['invoices'] = []
            for j in t:
                if j['id'] is None:
                    continue
                j['items'] = json.loads(j['items'])
                x['invoices'].append(j)
                x['service_start_date'] = j['billing_period']
            t = db.query("""
                select 
                    op.id,start_date,end_date,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',opi.id,'price',opi.price,'description',
                            opi.description,'quantity',opi.quantity
                        )
                    ) as items,round(datediff(end_date,now())/30,0) as months_left
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
            ret['legal'].append(x)
        ret['config'] = {}
        ret['config']['commission_users'] = db.query("""
            select id,concat(first_name,' ',last_name) as name from users 
                where id in (select user_id from user_entitlements where entitlements_id=10)
        """)
        ret['config']['provider_status'] = db.query("select id,name from provider_queue_status")
        ret['config']['invoice_status'] = db.query("select id,name from invoice_status")
        return ret

class LegalSave(AdminBase):
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
            db.update("insert into office (name,office_type_id,email,billing_system_id) values (%s,%s,%s,%s,%s)",
                (params['name'],OT['Provider'],params['email'],BS)
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,%s,'Created (New)'
                )
            """,(insid,user['id']))
        else:
            db.update("""
                update office set
                    name = %s, 
                    email = %s, 
                    active = %s
                    where id = %s
                """,(params['name'],params['email'],params['active'],params['id']))
            insid = params['id']
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,%s,'Updated Record'
                )
            """,(insid,user['id']))
        if 'commission_user_id' in params:
            db.update("""
                update office set commission_user_id=%s where id = %s
                """,(params['commission_user_id'],insid)
            )
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
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,%s,'Updated Record'
            )
        """,(params['id'],user['id']))
        db.commit()
        return {'success': True}

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

class BDRDashboard(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getCommissionsThisMonth(self,u):
        db = Query()
        PQS = self.getProviderQueueStatus()
        OT = self.getOfficeTypes()
        o = []
        if 'CommissionAdmin' in u['entitlements']:
            o = db.query("""
                select 
                    ifnull(t1.num1,0) as num1, /* commissions */
                    ifnull(t2.num2,0) as num2, /* Total paid */
                    ifnull(t3.num3,0) as num3, /* sent */
                    ifnull(t4.num4,0) as num4 /* Voided */
                from 
                    (select round(sum(amount),2) as num1 from commission_users a
                        where 
                        a.created > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                    (select round(sum(total),2) as num2 from invoices a
                        where 
                        a.invoice_status_id = 15 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                    (select round(sum(total),2) as num3 from invoices a
                        where 
                        a.invoice_status_id = 10 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                    (select round(sum(total),2) as num4 from invoices a
                        where 
                        a.invoice_status_id = 25 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
                """
            )
        else:
            o = db.query("""
                select 
                    ifnull(t1.num1,0) as num1, /* commissions */
                    ifnull(t2.num2,0) as num2, /* Total paid */
                    ifnull(t3.num3,0) as num3, /* sent */
                    ifnull(t4.num4,0) as num4 /* Voided */
                from 
                    (select round(sum(amount),2) as num1 from commission_users a
                        where 
                        a.user_id = %s and a.created > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                    (select round(sum(total),2) as num2 from invoices a,commission_users com
                        where 
                        a.id = com.invoices_id and com.user_id = %s and a.invoice_status_id = 15 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                    (select round(sum(total),2) as num3 from invoices a,commission_users com
                        where 
                        a.id = com.invoices_id and com.user_id = %s and a.invoice_status_id = 10 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                    (select round(sum(total),2) as num4 from invoices a,commission_users com
                        where 
                        a.id = com.invoices_id and com.user_id = %s and a.invoice_status_id = 25 
                        and a.billing_period > 
                        date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
                """,(u['id'],u['id'],u['id'],u['id'])
            )
        return o[0]

    @check_bdr
    def execute(self, *args, **kwargs):
        ret = {}
        u = args[1][0]
        ret['commissions'] = self.getCommissionsThisMonth(u)
        return ret
