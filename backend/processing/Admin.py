# coding=utf-8

import sys
import os
import uuid
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
from util import tzInfo
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.OfficeReferrals import ReferrerUpdate
from processing.Audit import Audit
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin,check_bdr,check_crm
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

    def getTrafficStatsMonth(self):
        db = Query()
        ret = {}
        o = db.query("""
            WITH RECURSIVE t as (
                select date(date_add(now(),INTERVAL -6 MONTH)) as dt,
                 (select count(id) from traffic_incidents p
                    where 
                    month(date(date_add(now(),INTERVAL -6 MONTH)))=month(p.created) 
                    and p.traffic_categories_id = 2 
                    and year(date(date_add(now(),INTERVAL -6 MONTH)))=year(p.created) 
                 ) as count1,
                 (select count(id) from traffic_incidents p
                    where 
                    month(date(date_add(now(),INTERVAL -6 MONTH)))=month(p.created) 
                    and p.traffic_categories_id = 2 
                    and year(date(date_add(now(),INTERVAL -6 MONTH)))=year(p.created) 
                 ) as count2
                UNION 
                 SELECT DATE_ADD(t.dt, INTERVAL 1 MONTH) as month,
                 (select count(id) from traffic_incidents p
                    where 
                    date_format(t.dt,'%Y-%m-01') = date_format(p.created,'%Y-%m-01')
                    and p.traffic_categories_id = 2 
                 ) as count1,
                 (select count(id) from traffic_incidents p
                    where 
                    date_format(t.dt,'%Y-%m-01') = date_format(p.created,'%Y-%m-01')
                    and p.traffic_categories_id = 2 
                 ) as count2
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 day) <= now() 
            )
            select dt as label,count1,count2 FROM t ;
            """,)
        ret['month'] = o
        o = db.query("""
            WITH RECURSIVE t as (
                select date(date_add(now(),INTERVAL -7 day)) as dt,
                 (select count(id) from traffic_incidents p
                    where 
                    day(date(date_add(now(),INTERVAL -7 day)))=day(p.created) 
                    and p.traffic_categories_id = 2 
                    and month(date(date_add(now(),INTERVAL -7 day)))=month(p.created) 
                    and year(date(date_add(now(),INTERVAL -7 day)))=year(p.created) 
                 ) as count1,
                 (select count(id) from traffic_incidents p
                    where 
                    day(date(date_add(now(),INTERVAL -7 day)))=day(p.created) 
                    and p.traffic_categories_id = 2 
                    and month(date(date_add(now(),INTERVAL -7 day)))=month(p.created) 
                    and year(date(date_add(now(),INTERVAL -7 day)))=year(p.created) 
                 ) as count2
                UNION 
                 SELECT DATE_ADD(t.dt, INTERVAL 1 day) as month,
                 (select count(id) from traffic_incidents p
                    where 
                    day(t.dt)=day(p.created) and month(t.dt)=month(p.created) and year(t.dt)=year(p.created) 
                    and p.traffic_categories_id = 2 
                 ) as count1,
                 (select count(id) from traffic_incidents p
                    where 
                    day(t.dt)=day(p.created) and month(t.dt)=month(p.created) and year(t.dt)=year(p.created) 
                    and p.traffic_categories_id = 2 
                 ) as count2
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 DAY) <= date_add(now(),interval 1 day)
            )
            select date_format(date_add(dt,interval -1 day),'%a, %D') as label,count1,count2 FROM t ;
            """,)
        ret['week'] = o
        ret['labels'] = ['Accidents per day','Accidents per day']
        return ret

    def getWebsiteStatsMonth(self):
        db = Query()
        ret = {}
        o = db.query("""
            WITH RECURSIVE t as (
                select date(date_add(now(),INTERVAL -6 MONTH)) as dt,
                 (select count(id) from performance p
                    where 
                    month(date(date_add(now(),INTERVAL -6 MONTH)))=month(p.created) 
                    and year(date(date_add(now(),INTERVAL -6 MONTH)))=year(p.created) 
                 ) as count1,
                 (select max(ms) from performance p
                    where 
                    month(date(date_add(now(),INTERVAL -6 MONTH)))=month(p.created) 
                    and year(date(date_add(now(),INTERVAL -6 MONTH)))=year(p.created) 
                 ) as count2
                UNION 
                 SELECT DATE_ADD(t.dt, INTERVAL 1 MONTH) as month,
                 (select count(id) from performance p
                    where 
                    date_format(t.dt,'%Y-%m-01') = date_format(p.created,'%Y-%m-01')
                 ) as count1,
                 (select max(ms) from performance p
                    where 
                    date_format(t.dt,'%Y-%m-01') = date_format(p.created,'%Y-%m-01')
                 ) as count2
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 day) <= now() 
            )
            select dt as label,count1,count2 FROM t ;
            """,)
        ret['month'] = o
        o = db.query("""
            WITH RECURSIVE t as (
                select date(date_add(now(),INTERVAL -7 day)) as dt,
                 (select count(id) from performance p
                    where 
                    day(date(date_add(now(),INTERVAL -7 day)))=day(p.created) 
                    and month(date(date_add(now(),INTERVAL -7 day)))=month(p.created) 
                    and year(date(date_add(now(),INTERVAL -7 day)))=year(p.created) 
                 ) as count1,
                 (select max(ms) from performance p
                    where 
                    day(date(date_add(now(),INTERVAL -7 day)))=day(p.created) 
                    and month(date(date_add(now(),INTERVAL -7 day)))=month(p.created) 
                    and year(date(date_add(now(),INTERVAL -7 day)))=year(p.created) 
                 ) as count2
                UNION 
                 SELECT DATE_ADD(t.dt, INTERVAL 1 day) as month,
                 (select count(id) from performance p
                    where 
                    day(t.dt)=day(p.created) and month(t.dt)=month(p.created) and year(t.dt)=year(p.created) 
                 ) as count1,
                 (select avg(ms) from performance p
                    where 
                    day(t.dt)=day(p.created) and month(t.dt)=month(p.created) and year(t.dt)=year(p.created) 
                 ) as count2
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 DAY) <= date_add(now(),interval 1 day)
            )
            select date_format(date_add(dt,interval -1 day),'%a, %D') as label,count1,count2 FROM t ;
            """,)
        ret['week'] = o
        ret['labels'] = ['Page views','Max Response (ms)']
        return ret

    def getTrafficMonth(self):
        db = Query()
        o = db.query("""
            WITH RECURSIVE t as (
                select date(date_add(now(),INTERVAL -6 MONTH)) as dt,0 as count
                UNION ALL
                 SELECT DATE_ADD(t.dt, INTERVAL 1 MONTH) as month,
                 (select count(id) from traffic_incidents ti
                    where 
                    month(t.dt)=month(ti.created) and year(t.dt)=year(ti.created) and
                    ti.traffic_categories_id = 2
                 ) as count
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 DAY) <= date_add(now(),interval 1 day)
            )
            select date_format(date_add(dt,interval -1 day),'%b, %Y') as label,count FROM t ;
            """,)
        return o

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
        # ret['traffic'] = self.getTrafficStats()
        ret['traffic'] = self.getTrafficMonth()
        ret['traffic_trend'] = self.getTrafficStatsMonth()
        ret['website_stats'] = self.getWebsiteTraffic()
        ret['website_performance'] = self.getWebsiteStatsMonth()
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

    @check_crm
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
                p.id,p.price,p.locations,p.duration,p.slot,p.description,
                p.upfront_cost,ot.name as office_type,ot.id as office_type_id,
                p.start_date,p.end_date,p.active,p.created,p.updated
            from
                pricing_data p, office_type ot
            where
                ot.id = p.office_type_id
            order by
                description asc
            """
        )
        for x in o:
            x['coupons'] = db.query("""
                select 
                    c.id,
                    c.name,
                    c.pricing_data_id as pricing_id,
                    c.total,
                    c.perc,
                    c.reduction
                from coupons c
                    where pricing_data_id=%s
                """,(x['id'],)
            )
            ret.append(x)
        ret = o
        return ret

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
            """,(PQ['IN_NETWORK'],)
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


class OnlineDemoList(AdminBase):

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
        ret['config'] = {}
        q = """
            select 
                id,description,meeting_id,start_date,end_date,url
            from 
                online_demo_meetings
            """
        p = []
        p.append(limit)
        p.append(offset*limit)
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,))
        ret['total'] = cnt[0]['cnt']
        q += " order by created desc " 
        q += " limit %s offset %s " 
        o = db.query(q,p)
        ret['data'] = o
        return ret

class OnlineDemoSave(AdminBase):

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
        ret['config'] = {}
        # Input from front end comes in straight form. Set it to UTC date by adding offset
        # TODO: Compensate for CDT/CST
        TZ = tzInfo.getTZ()
        mytz = 0
        if params['timezone'] in TZ:
            mytz = TZ[params['timezone']]
        if 'id' in params:
            db.update("""
                update online_demo_meetings set 
                    description=%s,
                    start_date=date_add(%s,interval %s HOUR),
                    end_date=date_add(%s,interval %s HOUR)
                where id = %s
                """,(params['description'],params['start_date'],mytz,params['end_date'],mytz,params['id'])
            )
        else:
            u = config.getKey("host_url")
            ud = str(uuid.uuid4())
            url = "%s/online-demo/%s" % (u,ud)
            db.update("""
                insert into online_demo_meetings 
                    (description,meeting_id, start_date,end_date, url)
                    values (%s,%s,date_add(%s, INTERVAL %s HOUR),date_add(%s,INTERVAL %s HOUR),%s)
                """,(params['description'],ud,params['start_date'],mytz,params['end_date'],mytz,url)
            )
        db.commit()
        return {'success':True}

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

class NotificationsList(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        o = db.query("""
            select 
                lat,lng,state,city,url,created,
                    timestampdiff(minute,created,now()) as timer
            from visits
            where 
                timestampdiff(minute,created,now()) < 30 and
                    lat <> 0 and city is not null
            limit 5
            """)
        for x in o:
            msg = "Visit from %s, %s to %s" % (x['city'],x['state'],x['url'])
            ret.append({
                'created': x['created'],
                'message': msg, 
                'city': x['city'],
                'state': x['state'],
                'timer': x['timer'],
                'url': x['url'],
                'coords': {'lat': x['lat'], 'lng':x['lng']}
            })
        return ret

