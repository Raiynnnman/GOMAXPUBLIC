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
                    and cio.client_intake_status_id=%s) as t4
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
                u.phone,u.active,ou.office_id
            from 
                users u,
                user_entitlements ue,
                office_user ou
            where 
                u.id <> 1 and
                u.id = ue.user_id and
                ou.user_id = u.id and 
                ue.entitlements_id = %s
            order by 
                u.updated desc
            """
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q % ENT['Customer']))
        q += " limit %s offset %s " 
        o = db.query(q,(ENT['Customer'],limit,offset*limit))
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
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % (url,)
        
        m = Mail()
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Welcome to POUNDPAIN TECH","templates/mail/welcome.html",data)
        else:
            m.defer(email,"Welcome to POUNDPAIN TECH","templates/mail/welcome.html",data)
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
        INV = self.getInvoiceIDs()
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
                    o.priority,pq.do_not_contact,
                    ot.name as office_type,o.updated,o.commission_user_id,
                    trim(concat(comu.first_name, ' ', comu.last_name)) as commission_name
                from 
                    office o
                    left outer join office_addresses oa on oa.office_id=o.id
                    left outer join office_type ot on o.office_type_id = ot.id
                    left outer join provider_queue pq on pq.office_id = o.id
                    left outer join provider_queue_status pqs on pq.provider_queue_status_id=pqs.id
                    left outer join users comu on comu.id = o.commission_user_id
                    left join  users u on u.id = o.user_id
                where 
                    o.office_type_id <> %s 
            """ % (OT['Customer'],)
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
        elif 'status' in params and params['status'] is not None and len(params['status']) > 0:
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
            x['last_paid'] = db.query("""
                select max(billing_period) as a from invoices
                    where office_id = %s and invoice_status_id=%s
                """,(x['id'],INV['PAID'])
            )
            if len(x['last_paid']) > 0:
                x['last_paid'] = x['last_paid'][0]['a']
            else:
                x['last_paid'] = None
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
            if len(x['addr']) > 0:
                x['phone'] = x['addr'][0]['phone']
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
            select 1,'System' as name
            UNION ALL
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
            db.update("""
                update commission_users set user_id=%s where office_id = %s
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
        if 'priority' in params:
            db.update("""
                update office set priority=%s where id=%s
            """,(params['priority'],params['id'],)
        )
        if 'do_not_contact' in params:
            db.update("""
                update provider_queue set do_not_contact=%s where office_id=%s
            """,(params['do_not_contact'],params['id'],)
            )
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


class WelcomeEmailReset(AdminBase):

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
        """,(email.lower(),)
        )
        if len(o) < 1:
            ret = { 
                "success":False,
                "message": "USER_DOESNT_EXIST"
            }
            return ret
        user_id = o[0]['id']
        url = config.getKey("host_url")
        ul = UserLogin.ResetPasswordGetToken()
        val = ul.genToken(user_id,email.lower())
        data = { 
            '__LINK__':"%s/#/reset/%s" % (url,val.decode('utf-8')),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/reset/%s" % (url,val.decode('utf-8'))
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        sysemail = config.getKey("support_email")
        m = Mail()
        data['__OFFICE_NAME__'] = params['name']
        data['__OFFICE_URL__'] = "%s/#/app/main/admin/office/%s" % (url,off_id)
        if self.isUIV2(): 
            data['__OFFICE_URL__'] = "%s/app/main/admin/office/%s" % (url,off_id)
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Welcome to POUNDPAIN TECH","templates/mail/welcome-reset.html",data)
            m.sendEmailQueued(sysemail,"New Customer Signed Up","templates/mail/office-signup.html",data)
        else:
            m.defer(email,"Welcome to POUNDPAIN TECH","templates/mail/welcome-reset.html",data)
            m.defer(sysemail,"New Customer Signed Up","templates/mail/office-signup.html",data)
        return ret


class AdminReportGet(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def OfficeReport(self):
        PQ = self.getProviderQueueStatus()
        INV = self.getInvoiceIDs()
        db = Query()
        o = db.query(
            """
            select 
                o.id,o.name,o.email,
                concat(oa.addr1,' ',oa.addr2),
                oa.city,oa.state,oa.zipcode,oa.phone,
                pd.description as subscription_plan,
                pd.duration as subscription_duration,
                op.start_date as plan_start,
                op.end_date as plan_end
            from
                office o
                left outer join office_addresses oa on oa.office_id=o.id
                left join provider_queue pq on pq.office_id=o.id
                left join office_plans op on op.office_id=o.id
                left join pricing_data pd on op.pricing_data_id=pd.id
            where
                pq.provider_queue_status_id=%s
            """,(PQ['INVITED'],)
        )
        ret = []
        for y in o:
            y['next_invoice'] = db.query("""
                select 
                date_add(max(i.billing_period),INTERVAL 1 MONTH) as next_invoice
                from invoices i where office_id=%s
                """,(y['id'],)
            )
            if len(y['next_invoice']) > 0:
                y['next_invoice'] = y['next_invoice'][0]['next_invoice']
            else:
                y['next_invoice'] = ''
            y['last_paid'] = db.query("""
                select 
                date_add(max(i.billing_period),INTERVAL 1 MONTH) as last_paid
                from invoices i where office_id=%s and invoice_status_id=%s
                """,(y['id'],INV['PAID'])
            )
            if len(y['last_paid']) > 0:
                y['last_paid'] = y['last_paid'][0]['last_paid']
            else:
                y['last_paid'] = ''
            y['customers_referred'] = db.query("""
                select 
                count(cio.id) as cnt from client_intake_offices cio, client_intake ci
                where cio.client_intake_id = ci.id and office_id=%s and hidden=0 group by office_id 
                """,(y['id'],)
            )
            if len(y['customers_referred']) > 0:
                y['customers_referred'] = y['customers_referred'][0]['cnt']
            else:
                y['customers_referred'] = 0
            y['customers_referred_hidden'] = db.query("""
                select 
                count(cio.id) as cnt from client_intake_offices cio,client_intake ci
                where cio.client_intake_id = ci.id and office_id=%s and hidden=1 group by office_id 
                """,(y['id'],)
            )
            if len(y['customers_referred_hidden']) > 0:
                y['customers_referred_hidden'] = y['customers_referred_hidden'][0]['cnt']
            else:
                y['customers_referred_hidden'] = 0
            ret.append(y)

        ret = pd.DataFrame.from_dict(ret)
        return ret

    def OfficeReport2(self):
        q = """
            select
                o.id,o.name,o.email,i.id as invoice_id,
                pq.do_not_contact,o.priority,
                i5.addr1,i5.city,i5.state,i5.zipcode,
                i5.phone,
                pd.description as subscription_plan,
                pd.duration as subscription_duration,
                op.start_date as plan_start,
                op.end_date as plan_end,
                i1.name as first_invoice_status, i1.bp as  first_billing_period,
                i1.total as first_invoice_total,
                i2.name as last_invoice_status, i2.bp as  last_billing_period,
                i2.total as last_invoice_total, 
                date_add(max(i.billing_period),INTERVAL 1 MONTH) as next_invoice,
                i3.bp as last_paid
            from
                office o
                left outer join invoices i on i.office_id=o.id
                left outer join office_plans op on op.office_id = o.id
                left outer join provider_queue pq on pq.office_id = o.id
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
                left outer join (
                    select i.office_id,i.total,i.id,isi.name,max(i.billing_period) as bp
                        from invoices i,invoice_status isi where 
                        i.invoice_status_id=15 and isi.id=i.invoice_status_id group by office_id
                        order by max(i.billing_period) desc
                ) i3 on i3.office_id = o.id
                left outer join (
                    select oa.office_id,
                        concat(oa.addr1, ' ', oa.addr2) as addr1,
                        oa.city,
                        oa.state,oa.zipcode,oa.phone
                        from office_addresses oa 
                ) i5 on i5.office_id = o.id
            where
                o.active = 1 
            group by o.id
            """
        db = Query()
        o = db.query(q)
        ret = []
        for y in o:
            ret.append(y)

        ret = pd.DataFrame.from_dict(ret)
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
                ru.updated,o.id as office_id, ro.name as referrer_name,
                timestampdiff(minute,ru.created,now()) as time
            from 
                referrer_users ru
                left join referrer_users_status rs on ru.referrer_users_status_id=rs.id
                left outer join office ro on ru.referrer_id=ro.id
                left outer join office o on o.id = ru.office_id
            where 
                1 = 1
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
        q += " order by updated desc " 
        q += " limit %s offset %s " 
        o = db.query(q,p)
        ret['data'] = o
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
