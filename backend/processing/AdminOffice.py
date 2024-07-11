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
from processing.Admin import AdminBase
from processing.Audit import Audit
from processing import Search,Office
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin,check_bdr
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

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
                    o.stripe_cust_id,o.old_stripe_cust_id,pq.tags,
                    o.priority,pq.do_not_contact,pq.provider_queue_status_id pq_status_id,
                    pqs.name as provider_queue_status,ot.name as office_type,o.updated,o.commission_user_id,
                    trim(concat(comu.first_name, ' ', comu.last_name)) as commission_name,pq.website,
                    trim(concat(setu.first_name, ' ', setu.last_name)) as setter_name,
                    o.office_alternate_status_id, oas1.name as office_alternate_status_name
                from 
                    office o
                    left outer join office_type ot on o.office_type_id = ot.id
                    left outer join office_phones op on op.office_id = o.id
                    left outer join provider_queue pq on pq.office_id = o.id
                    left outer join provider_queue_status pqs on pq.provider_queue_status_id=pqs.id
                    left outer join users comu on comu.id = o.commission_user_id
                    left outer join users setu on setu.id = o.setter_user_id
                    left outer join office_alternate_status oas1 on o.office_alternate_status_id=oas1.id
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
            q += """ and (o.email like %s  or o.name like %s or op.phone like %s ) 
            """
            search_par.insert(0,params['search']+'%%')
            search_par.insert(0,params['search']+'%%')
            search_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
            count_par.insert(0,params['search']+'%%')
        elif 'status' in params and params['status'] is not None and len(params['status']) > 0:
            q += " and pq.provider_queue_status_id in (%s) " % ','.join(map(str,params['status']))
        if 'alt_status' in params and params['alt_status'] is not None and 0 not in params['alt_status']:
            q += " and office_alternate_status_id in ("
            arr = []
            for z in params['alt_status']:
                arr.append("%s")
                count_par.append(z)
                search_par.append(z)
            q += ",".join(map(str,arr))
            q += ")"
        q += " group by o.id order by o.updated desc "
        cnt = db.query("select count(id) as cnt from (" + q + ") as t", count_par)
        repquery = q
        q += " limit %s offset %s " 
        ret['total'] = cnt[0]['cnt']
        o = db.query(q,search_par)
        ret['offices'] = []
        for x in o:
            x['addr'] = db.query("""
                select
                  oa.id,oa.name,addr1,addr2,phone,
                  city,oa.state,oa.zipcode
                from office_addresses oa
                  where oa.office_id=%s and oa.deleted = 0
                """,(x['id'],)
            )
            x['phones'] = db.query("""
                select id,phone from office_phones 
                    where office_id=%s
                """,(x['id'],)
            )
            x['users'] = db.query("""
                select u.id,u.email,u.first_name,u.last_name,u.phone,
                    concat(u.first_name, ' ',u.last_name) as name
                from 
                    users u,
                    office_user ou
                where 
                    u.active = 1 and
                    u.id = ou.user_id and
                    ou.office_id = %s
                """,(x['id'],)
            )
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
                    UNION ALL
                    select 1,'System',''
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
        if 'report' in params:
            j = db.query(repquery,count_par)
            v = []
            for g in j:
                g['addr'] = db.query("""
                    select
                      oa.id,oa.name,addr1,addr2,phone,
                      city,oa.state,oa.zipcode
                    from office_addresses oa
                      where oa.office_id=%s and oa.deleted = 0
                    """,(g['id'],)
                )
                c = 0
                for k in g['addr']:
                    k['addr_%s_addr1' % c] = k['addr1']
                    k['addr_%s_addr2' % c] = k['addr1']
                    k['addr_%s_phone' % c] = k['phone']
                    k['addr_%s_city' % c] = k['city']
                    k['addr_%s_state' % c] = k['state']
                    k['addr_%s_zipcode' % c] = k['zipcode']
                    g.update(k)
                    c += 1
                del g['addr']
                v.append(g)
            frame = pd.DataFrame.from_dict(v)
            report = 'report.csv'
            ret['filename'] = report
            t = frame.to_csv()
            ret['content'] = base64.b64encode(t.encode('utf-8')).decode('utf-8')
        ret['config'] = {}
        ret['config']['commission_users'] = db.query("""
            select 1 as id,'System' as name
            UNION ALL
            select id,concat(first_name,' ',last_name) as name from users u
                where u.active=1 and id in (select user_id from user_entitlements where entitlements_id=10)
            UNION ALL
            select id,concat(first_name,' ',last_name) as name from users u
                where u.active=1 and id in (select user_id from user_entitlements where entitlements_id=14)
        """)
        ret['config']['coupons'] = db.query("select id,name,total,perc,reduction from coupons")
        ret['config']['provider_status'] = db.query("select id,name from provider_queue_status")
        ret['config']['alternate_status'] = db.query("""
                select 0 as id,'NONE' as name
                UNION ALL
                select id,name from office_alternate_status""")
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
        if 'pq_status_id' in params:
            db.update("""
                update provider_queue set provider_queue_status_id=%s where office_id = %s
                """,(params['pq_status_id'],params['id'])
            )
        if 'email' in params:
            db.update("""
                update office set email=%s where id = %s
                """,(params['email'],params['id'])
            )
        if 'website' in params:
            db.update("""
                update provider_queue set website=%s where office_id = %s
                """,(params['website'],params['id'])
            )
        if 'office_alternate_status_id' in params:
            db.update("""
                update office set office_alternate_status_id=%s where id = %s
                """,(params['office_alternate_status_id'],params['id'])
            )
        if 'setter_user_id' in params:
            db.update("""
                update office set setter_user_id=%s where id = %s
                """,(params['setter_user_id'],insid)
            )
        if 'commission_user_id' in params:
            db.update("""
                update office set commission_user_id=%s where id = %s
                """,(params['commission_user_id'],insid)
            )
            db.update("""
                update commission_users set user_id=%s where office_id = %s
                """,(params['commission_user_id'],insid)
            )
        if 'users' in params:
            for x in params['users']:
                if 'id' in x:
                    h = HumanName(x['name'])
                    first = "%s %s" % (h.title,h.first)
                    last = "%s %s" % (h.last,h.suffix)
                    db.update("""
                        update users set
                            first_name=%s, last_name=%s, email=%s,phone=%s
                        where id = %s
                        """,(first,last,x['email'],x['phone'],x['id'])
                    )
                    if 'deleted' in x and x['deleted']:
                        db.update("""
                            update users set active=0 where id=%s
                        """,(x['id'],)
                        )
                    db.update("""
                        insert into office_history (office_id,user_id,text) values
                            (%s,%s,%s)""",(params['id'],user['id'],"UPDATED_USER")
                    )
                else:
                    h = HumanName(params['name'])
                    first = "%s %s" % (t1.title,t1.first)
                    last = "%s %s" % (t1.last,t1.suffix)
                    db.update("""
                        insert into users
                            (first_name,last_name,email,phone)
                        values 
                        (%s,%s,%s)
                        """,(first,last,x['email'],x['phone'])
                    )
                    g = db.query("select LAST_INSERT_ID()");
                    g = g[0]['LAST_INSERT_ID()']
                    db.update("""
                        insert into office_user (office_id,user_id) values (%s,%s)
                        """,(insid,g)
                    )
                    db.update("""
                        insert into office_history (office_id,user_id,text) values
                            (%s,%s,%s)""",(params['id'],user['id'],"ADDED_USER")
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
        for x in params['addr']:
            if 'addr2' not in x:
                x['addr2'] = ''
            if 'id' in x and x['id'] is not None:
                db.update("""
                    update office_addresses set 
                      name=%s,addr1=%s,addr2=%s,phone=%s,city=%s,state=%s,zipcode=%s
                    where id=%s
                    """,(
                        x['name'],x['addr1'],x['addr2'],x['phone'],
                        x['city'],x['state'],x['zipcode'],
                        x['id'],
                    )
                )
                if 'deleted' in x and x['deleted']:
                    db.update("""
                        update office_addresses set deleted=1 where id=%s
                    """,(x['id'],)
                    )
            else:
                db.update(
                    """
                        insert into office_addresses (
                            office_id,name,addr1,addr2,phone,city,state,zipcode
                        ) values (%s,%s,%s,%s,%s,%s,%s,%s)
                    """,(insid,x['name'],x['addr1'],x['addr2'],x['phone'],x['city'],x['state'],x['zipcode'])
                )
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,%s,'Updated Record'
            )
        """,(params['id'],user['id']))
        db.commit()
        return {'success': True}
