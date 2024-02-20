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
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from processing import Search,Office,Bundles
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
                ifnull(t1.num1,0) as num1, /* num leads */
                ifnull(t2.num2,0) as num2, /* leads won */
                ifnull(t3.num3,0) as num3, /* leads lost */
                ifnull(t4.num4,0) as num4 /* leads invalid */
            from
                (select count(id) as num1 from leads where created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                (select count(l.id) as num2 from leads l, leads_status ls where ls.id=l.leads_status_id and 
                    ls.name='WON' and created > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                (select count(l.id) as num3 from leads l, leads_status ls where ls.id=l.leads_status_id and 
                    ls.name='LOST' and created > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                (select count(l.id) as num4 from leads l, leads_status ls where ls.id=l.leads_status_id and 
                    ls.name='INVALID' and created > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
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

    def getLeadsRevenueMonth(self):
        db = Query()
        o = db.query("""
            select 
                ifnull(t1.num1,0) as num1, /* num leads */
                ifnull(t2.num2,0) as num2, /* revenue */
                ifnull(t3.num3,0) as num3, /* sales */
                ifnull(t4.num4,0) as num4  /* leads that have generated appt */
            from 
                (select count(id) as num1 from leads where created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                (select round(sum(dhd_total),2) as num2 from invoices a, 
                    physician_schedule ps, physician_schedule_scheduled pss 
                    where ps.id=pss.physician_schedule_id and 
                    a.physician_schedule_id=ps.id and pss.leads_id > 0 and a.created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                (select round(sum(patient_total),2) as num3 from invoices a, 
                    physician_schedule ps, physician_schedule_scheduled pss 
                    where ps.id=pss.physician_schedule_id and 
                    a.physician_schedule_id=ps.id and pss.leads_id > 0 and a.created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t3,
                (select count(id) as num4 from physician_schedule_scheduled where leads_id > 0 
                    and created > date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t4
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
                (select round(sum(dhd_total),2) as num1 from invoices a
                    where a.created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t1,
                (select round(sum(patient_total),2) as num2 from invoices a
                    where a.created > 
                    date_add(date_add(LAST_DAY(now()),interval 1 DAY),interval -1 MONTH)) as t2,
                (select count(id) as num3 from appt_bundle where created > 
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
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        ENT = self.getEntitlementIDs()
        o = db.query("""
            select 
                u.id,u.email,u.first_name,u.last_name,
                u.phone,u.active
            from 
                users u
            """
        )
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
                 where user_id=%s and e.id=ue.office_id
                """,(x['id'],))
            ret['users'].append(x)
        return ret

class ConsultantList(AdminBase):
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
        ENT = self.getEntitlementIDs()
        o = db.query("""
            select 
                u.id,u.email,u.first_name,u.last_name,
                u.phone,c.addr1,c.addr2,c.city,c.state,c.zipcode,
                c.lat, c.lon, u.active,c.ein_number
            from 
                users u,consultant c 
            where 
                c.user_id = u.id and 
                u.active = 1 and
                c.active = 1
            """
        )
        ret['consultants'] = o
        return ret

class ConsultantUpdate(AdminBase):
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
        if 'ein_number' not in params or params['ein_number'] == '':
            return { 'success': False, 'message': 'CONSULTANT_EIN_REQUIRED' }
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
                """,(user_id,ENT['Consultant'])
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
                update consultant set updated=now(),active=%s,addr1=%s,addr2=%s,
                phone=%s,city=%s,state=%s,zipcode=%s,ein_number=%s where user_id=%s
                """,(params['active'],params['addr1'],params['addr2'],
                     params['phone'],params['city'],params['state'],
                     params['zipcode'],params['ein_number'],params['id']
                )
            )
        else:
            db.update("""
                insert into consultant (user_id,addr1,addr2,phone,city,state,zipcode,ein_number) values
                (%s,%s,%s,%s,%s,%s,%s,%s)
                """,(user_id,params['addr1'],params['addr2'],
                     params['phone'],params['city'],params['state'],
                     params['zipcode'],params['ein_number']
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
            db.commit()
        if 'invoice_status_id' in params:
            db.update("""
                update invoices set updated=now(),invoice_status_id=%s where id=%s
                """,(params['id'],)
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
                i.nextcheck,i.bundle_id,stripe_invoice_number as number,
                u.first_name,u.last_name,ps.day,ps.time,s.name as subprocedure_name,
                stripe_invoice_number, from_unixtime(due) as due,u.id as user_id,
                o.id as office_id,o.name as office_name,u.email,u.phone,
                json_arrayagg(
                    json_object(
                        'id',ii.id,'code',ii.code,
                        'desc',ii.description,
                        'phy_total',round(ii.phy_total,2),
                        'dhd_total',round(ii.dhd_total,2),
                        'price', round(ii.price,2),
                        'quantity', ii.quantity
                    )
                ) as items,i.invoice_status_id,
                round(i.dhd_total,2),round(i.phy_total,2),round(i.patient_total,2)
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
                ist.id = i.invoice_status_id 
            """
        p = []
        if 'filter' in params and params['filter'] != 0:
            q += " and invoice_status_id = %s " 
            p.append(params['filter'])
        q += "group by i.id"
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
            x['address'] = db.query("""
                select addr1,addr2,phone,city,state,zipcode from user_addresses
                where user_id=%s
                """,(x['user_id'],)
            )
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

class BundleList(AdminBase):
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
        o = db.query(
            """
            select
               b.id,b.name as bundle_name, o.name as office_name,
               o.id as office_id, cm.code, cm.description, 
               round(ifnull(b.markup,1),2) as markup, o.dhd_markup,
                json_arrayagg(
                    json_object(
                        'id',bi.id,'code',bi.code,
                        'assigned',bi.user_id,
                        'desc',bi.description,
                        'cpt_id',bi.icd_cpt_id,
                        'cpt',cpt.code,
                        'price', round(bi.price,2),
                        'markup', round(ifnull(b.markup,1),2),
                        'dhd_markup', round(ifnull(o.dhd_markup,1),2),
                        'quantity', bi.quantity,
                        'market', round(ifnull(o.dhd_markup,1)*bi.price*ifnull(b.markup,1),2)
                    )
                ) as items
            from
                bundle b 
                left join office o on o.id=b.office_id
                left join office_addresses oa on oa.office_id=o.id
                left outer join bundle_items bi on bi.bundle_id = b.id 
                left outer join icd_cm cm on b.icd_cm_id = cm.id
                left outer join icd_cpt cpt on bi.icd_cpt_id = cpt.id
            group by
                b.id
            """
        )
        for x in o:
            q = db.query("""
                select json_arrayagg(
                    json_object(
                        'user_id',user_id,'changes',changes
                    )
                ) as history
                from bundle_history where bundle_id=%s
            """,(x['id'],))
            j = x
            j['history'] = []
            if len(q) > 0:
                j['history'] = q[0]["history"]
                if j['history'] is not None:
                    j['history'] = json.loads(j['history'])
                else:
                    j['history'] = []
            j['items'] = json.loads(x['items'])
            newitems = []
            for q in j['items']:
                if q['id'] is None:
                    continue
                ni = q
                newitems.append(ni)
            j['items'] = newitems
            o = db.query("""
                select 
                    u.id,u.first_name,u.last_name
                from
                    office_user oa, users u
                where 
                    oa.user_id=u.id    
                    and oa.office_id=%s
                """,(j['office_id'],)
            )
            j['physicians'] = o
            ret.append(j)
        return ret

class BundleUpdate(AdminBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False


    def saveBundle(self,params,off_id,db):
        bu = Bundles.BundleUpdate()
        ret = bu.saveBundle(params,off_id,db)
        return ret

    def getOffice(self,name,params,db):
        o = db.query("""
            select id from office where name=%s
            """,(name,)
        )
        insid = 0
        OT = self.getOfficeTypes()
        if len(o) < 1:
            db.update("""
                insert into office (name,office_type_id) values (%s,%s)
                """,(name,OT['Physician'])
            )
            db.commit()
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            db.update(
                """
                    insert into office_addresses (
                        office_id,addr1,addr2,phone,city,state,zipcode
                    ) values (%s,%s,%s,%s,%s,%s,%s)
                """,(insid,params['addr1'],params['addr2'],
                     params['phone'],params['city'],params['state'],params['zipcode'])
            )
            db.commit()
        else:
            insid = o[0]['id']
        return insid
            
    def getBundleDetails(self,row,off_id,p_id,db):
        b = {}
        g = db.query("""
            select id from icd_cm where code=%s
            """,(row['CM Code'],)
        )
        b['cm_code'] = g[0]['id']
        b['name'] = row['Name']
        b['markup'] = int(row['CPT Rate %']) / 100
        g = db.query("""
            select id from icd_cpt where code=%s
            """,(row['CPT'],)
        )
        b['items'] = [{
            'cpt': g[0]['id'],
            'code': row['CPT'],
            'desc': 'CPT %s' % str(row['CPT']),
            'office_id': off_id,
            'assigned': p_id,
            'name': b['cm_code'],
            'quantity': 1,
            'price': row['CPT Price'],
            'markup': int(row['CPT Rate %'])/100
        }]
        return b

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {'message':[]}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        rowId = 0
        success = True
        if 'upload' not in params:
            self.saveBundle(params,params['office_id'],db)
        else:
            cont = params['upload']
            if 'mime' not in cont:
                return { 'success': False, 'message': 'UPLOAD_CONTENT_MISSING' }
            if 'content' not in cont or cont['content'] is None or len(cont['content']) < 1:
                return { 'success': False, 'message': 'UPLOAD_CONTENT_MISSING' }
            t = cont['content'].split(';')
            t = t[1].split(',')
            if len(t) != 2:
                return { 'success': False, 'message': 'FORMAT_INVALID_BASE_DATA' }
            t = t[1]
            try: 
                t = base64.b64decode(t)
                table = None
                if cont['mime'] == 'text/csv':
                    t = StringIO(t.decode('utf-8',errors='ignore'))
                    table = pd.read_csv(t,converters={
                        'CPT':str,'Office Zip':str,'HOSP Zip':str,'ASC Zip': str
                    })
                else: 
                    table = pd.read_excel(t)
                df = table
                df = df.fillna('')
                j = df.to_dict(orient='records')
                messages = []
                #for row in df.itertuples(index=True, name='Pandas'):
                for row in j:
                    d = {}
                    o = row['Office Name']
                    o_id = 0
                    a_id = 0
                    h_id = 0
                    if o is not None and len(o) > 0:
                        p = {
                            'addr1': row['Office Addr1'],
                            'addr2': row['Office Addr2'],
                            'city': row['Office City'],
                            'state': row['Office State'],
                            'phone': row['Office Phone'],
                            'zipcode': row['Office Zip']
                        }
                        o_id = self.getOffice(o,p,db)
                    a = row['ASC Name']
                    if a is not None and len(a) > 0:
                        p = {
                            'addr1': row['ASC Addr1'],
                            'addr2': row['ASC Addr2'],
                            'city': row['ASC City'],
                            'state': row['ASC State'],
                            'phone': row['ASC Phone'],
                            'zipcode': row['ASC Zip']
                        }
                        a_id = self.getOffice(a,p,db)
                    h = row['HOSP Name']
                    if h is not None and len(h) > 0:
                        p = {
                            'addr1': row['HOSP Addr1'],
                            'addr2': row['HOSP Addr2'],
                            'city': row['HOSP City'],
                            'state': row['HOSP State'],
                            'phone': row['HOSP Phone'],
                            'zipcode': row['HOSP Zip']
                        }
                        h_id = self.getOffice(h,p,db)
                    oass = db.query("""
                        select id from office_associations where
                            from_office_id=%s and to_office_id=%s
                        """,(o_id,o_id)
                    )
                    if len(o) < 1:
                        db.update("""
                            insert into office_associations (from_office_id,to_office_id) 
                            values (%s,%s)
                        """,(o_id,o_id)
                        )
                    if a_id > 0:
                        oass = db.query("""
                            select id from office_associations where
                                from_office_id=%s and to_office_id=%s
                            """,(o_id,a_id)
                        )
                        if len(oass) < 1 :
                            db.update("""
                                insert into office_associations (from_office_id,to_office_id) 
                                values (%s,%s)
                            """,(o_id,a_id)
                            )
                    if h_id > 0:
                        oass = db.query("""
                            select id from office_associations where
                                from_office_id=%s and to_office_id=%s
                            """,(o_id,h_id)
                        )
                        if len(oass) < 1:
                            db.update("""
                                insert into office_associations (from_office_id,to_office_id) 
                                values (%s,%s)
                            """,(o_id,h_id)
                            )
                    p_cont = { 
                        'first_name': row['Primary First'],
                        'last_name': row['Primary Last'],
                        'email': row['Primary Email'],
                        'phone': row['Primary Phone'],
                        'office_id': o_id
                    } 
                    c_cont = { 
                        'first_name': row['Coordinator First'],
                        'last_name': row['Coordinator Last'],
                        'email': row['Coordinator Email'],
                        'phone': row['Coordinator Phone'],
                        'office_id': o_id
                    } 
                    uu = Office.UsersUpdate()
                    p_id = uu.addUser(p_cont,o_id,db)
                    uu.addUser(c_cont,o_id,db)
                    b = self.getBundleDetails(row,o_id,p_id,db)
                    r = self.saveBundle(b,o_id,db)
                    r['row'] = rowId
                    ret['message'].append(r)
                    if not r['success']:
                        success = False
                    db.commit()
                    rowId += 1
            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
                print(str(e))
                return { 'success': False, 'message': 'PARSE_FORMAT_INVALID' }
            rowId += 1
        db.commit()
        ret['success'] = success
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
        m.defer(email,"Welcome to Direct Health Delivery","templates/mail/welcome.html",data)
        return ret

class OfficeList(AdminBase):

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
                    o.id,name,active,ein_number,email,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',oa.id,'addr1',addr1,'addr2',addr2,'phone',phone,
                            'city',city,'state',state,'zipcode',zipcode)
                    ) as addr,o.dhd_markup
                from 
                    office o
                left outer join office_addresses oa on oa.office_id=o.id
                where o.office_type_id = %s
                group by 
                    o.id
                limit %s offset %s
            """, (OT['Physician'],limit,offset)
        )
        ret = []
        for x in o:
            j = x
            j['addr'] = json.loads(x['addr'])
            ret.append(j)
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
        if 'dhd_markup' not in params:
            params['dhd_markup'] = 1
        if 'id' not in params:
            db.update("insert into office (name,ein_number,office_type_id,email,dhd_markup) values (%s,%s,%s,%s,%s)",
                (params['name'],params['ein_number'],OT['Physician'],params['email'],params['dhd_markup'])
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
        else:
            db.update("""
                update office set updated=now(),
                    dhd_markup=%s, name = %s, 
                    ein_number = %s, email = %s where id = %s
                """,(params['dhd_markup'],params['name'],params['ein_number'],params['email'],params['id']))
            insid = params['id']
        for x in params['addr']:
            if 'id' not in x or x['id'] == 0:
                db.update(
                    """
                        insert into office_addresses (
                            office_id,addr1,addr2,phone,city,state,zipcode
                        ) values (%s,%s,%s,%s,%s,%s,%s)
                    """,(insid,x['addr1'],x['addr2'],x['phone'],x['city'],x['state'],x['zipcode'])
                )
            else:
                db.update("""
                    update office_addresses set 
                        addr1=%s,addr2=%s,phone=%s,city=%s,state=%s,zipcode=%s
                    where id = %s
                """,(x['addr1'],x['addr2'],x['phone'],x['city'],x['state'],x['zipcode'],x['id'])
                )
        db.commit()
        return {'success': True}

class TransfersList(AdminBase):

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
        o = db.query("""
            select
                ot.id,ot.office_id,o.name as office_name,u.id as user_id,
                u.first_name,u.last_name,u.email,stripe_transfer_id,
                amount,ot.created,ot.invoices_id
            from
                office_transfers ot, users u, office o
            where
                u.id=ot.user_id and
                o.id=ot.office_id
            UNION
            select
                ot.id,0 as office_id,null as office_name,u.id as user_id,
                u.first_name,u.last_name,u.email,stripe_transfer_id,
                amount,ot.created,ot.invoices_id
            from
                consultant_transfers ot, users u
            where
                u.id=ot.consultant_user_id
            """)
        ret['transfers'] = o
        return ret

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
