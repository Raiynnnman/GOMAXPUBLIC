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
from processing.OfficeReferrals import ReferrerUpdate
from processing.Audit import Audit
from processing import Search,Office
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin,check_bdr,check_crm
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class RegistrationUpdate(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_crm
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
                u.first_name,u.last_name,u.email,u.phone,u.id as uid,
                o.office_alternate_status_id, oas1.name as office_alternate_status_name
                pq.initial_payment,op.id as planid
            from
                provider_queue pq
                left outer join provider_queue_status pqs on  pq.provider_queue_status_id = pqs.id
                left outer join office o on pq.office_id = o.id
                left outer join office_addresses oa on oa.office_id = o.id
                left outer join office_plans op on op.office_id = o.id
                left outer join office_user ou on ou.office_id = o.id
                left outer join users u on u.id = ou.user_id
                left outer join office_alternate_status oas1 on o.office_alternate_status_id=oas1.id
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
                insert into office_history(office_id,user_id,text) values (
                    %s,%s,'Created (New Record)'
                )
            """,(offid,user['id']))
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
                insert into office_history(office_id,user_id,text) values (
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
        if 'do_not_contact' in params:
            db.update("""
                update provider_queue set do_not_contact=%s where office_id=%s
            """,(params['do_not_contact'],off_id,)
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
        if 'office_alternate_status_id' in params:
            db.update("""
                update office set office_alternate_status_id=%s where id = %s
                """,(params['office_alternate_status_id'],offid)
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
        if 'actions' in params:
            for x in params['actions']:
                if 'id' not in x:
                    bb2 = encryption.encrypt(
                        x['action'],
                        config.getKey('encryption_key')
                        )
                    db.update("""
                        insert into provider_queue_actions(
                            user_id,provider_queue_id,action,provider_queue_actions_type_id,
                            provider_queue_actions_status_id
                        )
                        values 
                        (%s,%s,%s,%s,%s)
                        """,(user['user_id'],
                            pqid,bb2,
                            x['action_type_id'],x['action_status_id'])
                    )
                    db.update("""
                        insert into office_history (office_id,user_id,text) values
                            (%s,%s,%s)""",(offid,user['id'],"ADDED_ACTION")
                    )
                else:
                    db.update("""
                        update provider_queue_actions set provider_queue_actions_type_id=%s,
                            provider_queue_actions_status_id=%s where id=%s
                        """,(x['action_type_id'],x['action_status_id'],x['id'])
                    )
                    db.update("""
                        insert into office_history (office_id,user_id,text) values
                            (%s,%s,%s)""",(offid,user['id'],"UPDATED_ACTION")
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
                    """,(user['user_id'],offid,bb2)
                )
                db.update("""
                    insert into office_history (office_id,user_id,text) values
                        (%s,%s,%s)""",(offid,user['id'],"ADDED_COMMENT")
                )
        if 'do_not_contact' in params and params['do_not_contact']:
            db.update("""
                update provider_queue set do_not_contact=%s where office_id=%s
                """,(params['do_not_contact'],offid,)
            )
            db.update("""
                update provider_queue set provider_queue_status_id=%s where office_id=%s
                """,(PQS['DO_NOT_CONTACT'],offid,)
            )
        for a in params['addr']:
            if 'id' in a and a['id'] is not None:
                db.update("""
                    update office_addresses set 
                      name=%s,addr1=%s,addr2=%s,phone=%s,city=%s,state=%s,zipcode=%s
                    where id=%s
                    """,(
                        a['name'],a['addr1'],a['addr2'],a['phone'],
                        a['city'],a['state'],a['zipcode'],
                        a['id'],
                    )
                )
                if 'deleted' in x and x['deleted']:
                    db.update("""
                        update office_addresses set deleted=1 where id=%s
                    """,(a['id'],)
                    )
            else:
                db.update(
                    """
                        insert into office_addresses (
                            office_id,name,addr1,addr2,phone,city,state,zipcode
                        ) values (%s,%s,%s,%s,%s,%s,%s,%s)
                    """,(offid,x['name'],x['addr1'],x['addr2'],x['phone'],x['city'],x['state'],x['zipcode'])
                )
        if 'call_status_id' in params and params['call_status_id'] is not None:
            db.update(
                """
                    update provider_queue set provider_queue_call_status_id=%s
                    where office_id = %s
                """,(params['call_status_id'],offid,)
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
        if params['status'] == PQS['APPROVED'] or params['status'] == PQS['INVITED']:
            db.update("""
                update office set active = 1 where id = %s
                """,(offid,)
            )
            db.update("""
                update users set active = 1 where id in ( 
                    select user_id from office_user where office_id=%s
                )
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
            u = db.query("""
                select u.id,u.email  from users u,office_user ou
                    where u.id=ou.user_id and ou.office_id=%s
                """,(offid,)
            )
            db.commit()
            # TODO: Send welcome mail here
            #if len(u) > 0:
            #    we = WelcomeEmailReset()
            #    we.execute(0,[{'email': u[0]['email']}])
        self.setJenkinsID(offid)
        db.commit()
        return ret

class RegistrationList(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_crm
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
                pqcs.name as call_status, pqcs.id as call_status_id,
                ot.name as office_type,op.pricing_data_id as pricing_id,
                pq.do_not_contact,
                o.commission_user_id,oa.state,op.start_date,
                concat(comu.first_name, ' ', comu.last_name) as commission_name,
                coup.id as coupon_id,coup.name as coupon_name
            from
                provider_queue pq
                left join office o on pq.office_id = o.id
                left outer join office_addresses oa on oa.office_id = o.id 
                left outer join provider_queue_call_status pqcs on pq.provider_queue_call_status_id=pqcs.id
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
        if 'pq_id' in params and params['pq_id'] is not None and int(params['pq_id']) > 0:
            q += " and pq.id = %s "
            search_par.insert(0,int(params['pq_id']))
            count_par.append(int(params['pq_id']))
        elif 'mine' in params and params['mine'] is not None:
            q += " and o.commission_user_id = %s "
            search_par.insert(0,user['id'])
            count_par.append(user['id'])
        if 'status' in params and len(params['status']) > 0:
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
        if 'alt_status' in params and params['alt_status'] is not None:
            q += " and office_alternate_status_id in ("
            arr = []
            for z in params['alt_status']:
                if z == str(0) or z == 0:
                    arr.append(None)
                else:
                    arr.append(z)
            q += ",".join(map(str,arr))
            q += ")"
        if 'type' in params and params['type'] is not None:
            q += " and office_type_id in ("
            arr = []
            for z in params['type']:
                arr.append(z)
            q += ",".join(map(str,arr))
            q += ")"
        q += " group by o.id "
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
            x['actions']  = []
            acts = db.query("""
                select pqa.id,pqa.user_id,pqa.action,
                pqat.name as action_type,pqat.id as action_type_id,
                pqas.name as action_status, pqas.id as action_status_id,
                concat(u.first_name, ' ', u.last_name) as activity_name
                from 
                    provider_queue_actions pqa
                    left join provider_queue_actions_status pqas on pqa.provider_queue_actions_status_id=pqas.id
                    left join provider_queue_actions_type pqat on pqa.provider_queue_actions_type_id=pqat.id
                    left outer join users u on user_id=u.id
                where 
                    provider_queue_id = %s
                """,(x['id'],)
            )
            for cc in acts: 
                # This happens when we switch environments, just skip
                try:
                    bb2 = encryption.decrypt(
                        cc['action'],
                        config.getKey('encryption_key')
                        )
                    cc['action'] = bb2
                    x['actions'].append(cc)
                except:
                    pass
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
            x['assignee'] = db.query("""
                select
                    u.id,u.first_name,u.last_name
                from users u
                where id in
                (select user_id
                    from user_entitlements ue,entitlements e
                    where ue.entitlements_id=e.id and e.name='CRM')
                UNION ALL
                select
                    u.id,u.first_name,u.last_name
                from users u
                where id in
                (select user_id
                    from user_entitlements ue,entitlements e
                    where ue.entitlements_id=e.id and e.name='Admin')
                """
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
            x['addr'] = db.query("""
                select
                  oa.id,oa.name,addr1,addr2,phone,
                  city,oa.state,oa.zipcode
                from office_addresses oa
                  where oa.office_id=%s and oa.deleted = 0
                """,(x['office_id'],)
            )
            x['last_name'] = x['addr'][0]['last_name'] if len(x['addr']) > 0 else ''
            x['first_name'] = x['addr'][0]['first_name'] if len(x['addr']) > 0 else ''
            x['phone'] = x['addr'][0]['phone'] if len(x['addr']) > 0 else ''
            x['email'] = x['addr'][0]['email'] if len(x['addr']) > 0 else ''
            x['history'] = db.query("""
                select ph.id,user_id,text,concat(u.first_name, ' ', u.last_name) as user,ph.created
                    from office_history ph,users u
                where 
                    ph.user_id=u.id and
                    ph.office_id = %s
                order by created desc
                """,(x['office_id'],)
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
        ret['config']['alternate_status'] = db.query("""
                select 0 as id,'NONE' as name
                UNION ALL
                select id,name from office_alternate_status""")
        ret['config']['call_status'] = db.query("select id,name from provider_queue_call_status")
        ret['config']['action_status'] = db.query("select id,name from provider_queue_actions_status")
        ret['config']['action_type'] = db.query("select id,name from provider_queue_actions_type")
        ret['config']['status'] = db.query("select id,name from provider_queue_status")
        ret['config']['coupons'] = db.query("select id,name,total,perc,reduction from coupons")
        ret['config']['commission_users'] = db.query("""
            select 1 as id,'System' as name
            UNION ALL
            select id,concat(first_name,' ',last_name) as name from users 
                where id in (select user_id from user_entitlements where entitlements_id=10)
            UNION ALL
            select id,concat(first_name,' ',last_name) as name from users 
                where id in (select user_id from user_entitlements where entitlements_id=14)
        """)
        ret['config']['strength'] = db.query("select id,name from provider_queue_lead_strength")
        ret['registrations'] = k
        if 'report' in params and params['report'] is not None:
            ret['filename'] = 'provider_report.csv'
            frame = pd.DataFrame.from_dict(ret['registrations'])
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
        if 'value' not in params:
            return {'success': False,'message': 'DATA_REQUIRED'}
        inputs = ['name','phone','email','doa','address','attny','language']
        tosave = {}
        line = 0
        LANG = self.getLanguages()
        try: 
            j = params['value'].split('\n')
            for x in j:
                if ':' not in x:
                    continue
                i = x.split(':')
                if len(i) < 2:
                    continue
                key = i[0]
                value = i[1]
                key = key.lower()
                tosave[key] = value.rstrip().lstrip()
                line += 1 
            if 'address' not in tosave or len(tosave['address']) < 1:
                return {'success': False,'message': 'ADDRESS_REQUIRED'}
            api_key=config.getKey("google_api_key")
            gmaps = googlemaps.Client(key=api_key)
            # addr = pyap.parse(tosave['address'],country='US')
            addr = gmaps.geocode(tosave['address'])
            if len(addr) < 1:
                return {'success': False,'message': 'FAILED_TO_PARSE_ADDRESS'}
            addr = addr[0]
            lat = addr['geometry']['location']['lat']
            lon = addr['geometry']['location']['lng']
            places_id = addr['place_id']
            street = ''
            city = ''
            state =''
            postal_code = ''
            for y in addr['address_components']:
                if 'street_number' in y['types']:
                    street = y['long_name']
                if 'route' in y['types']:
                    street += " " + y['long_name']
                if 'locality' in y['types']:
                    city += y['long_name']
                if 'administrative_area_level_1' in y['types']:
                    state += y['long_name']
                if 'postal_code' in y['types']:
                    postal_code = y['long_name']
            tosave['addr1'] = street
            tosave['city'] = city
            tosave['state'] = state
            tosave['zipcode'] = postal_code
            if 'language' not in tosave:
                tosave['language'] = LANG['English']
            else:
                tosave['language'] = LANG[tosave['language']]
            tosave['fulladdr'] = tosave['address'] 
            del tosave['address']

            sha256 = encryption.getSHA256(json.dumps(tosave,sort_keys=True))
            have = db.query("""
                select id from client_intake where sha256=%s
                """,(sha256,)
            )

            if len(have) > 0:
                return {'success': False,'message': 'RECORD_ALREADY_EXISTS'}

            user_id = 0
            l = db.query("select id from users where email = %s",(tosave['email'].lower(),))
            for x in l:
                user_id = x['id']
            if user_id == 0:
                t1 = HumanName(tosave['name'])
                first = "%s %s" % (t1.title,t1.first)
                last = "%s %s" % (t1.last,t1.suffix)
                db.update("""
                    insert into users (email, first_name, last_name, phone ) values (%s,%s,%s,%s)
                    """,(tosave['email'],first,last,tosave['phone'])
                )
                user_id = db.query("select LAST_INSERT_ID()");
                user_id = user_id[0]['LAST_INSERT_ID()']
                db.update("""
                    insert into user_addresses (user_id,addr1,city,state,zipcode,fulladdr)
                        values (%s,%s,%s,%s,%s,%s)
                    """,(
                        user_id,
                        tosave['addr1'],
                        tosave['city'],
                        tosave['state'],
                        tosave['zipcode'],
                        tosave['fulladdr']
                        )
                )
                ext = '.json'
                sha256 = encryption.getSHA256(json.dumps(tosave,sort_keys=True))
                have = db.query("""
                    select id from client_intake where sha256=%s
                    UNION ALL
                    select id from referrer_users where sha256=%s
                    """,(sha256,sha256)
                )
                if len(have) > 0:
                    return {'success': False,'message': 'RECORD_ALREADY_EXISTS'}
                s3path = 'referrer/%s/%s' % (
                    off_id,
                    encryption.getSHA256("%s-%s" % (off_id,calcdate.getTimestampUTC()))
                )
                path = '%s%s' % (s3path,ext)
                q=db.update("""
                    insert into referrer_documents (office_id,s3path) values 
                        (%s,%s)
                """,(1,path)
                )
                insid = db.query("select LAST_INSERT_ID()");
                insid = insid[0]['LAST_INSERT_ID()']
                S3Processing.uploadS3ItemToBucket(
                    config.getKey("document_bucket_access_key"),
                    config.getKey("document_bucket_access_secret"),
                    config.getKey("document_bucket"),
                    path,
                    "application/json",
                    json.dumps(tosave)
                )
                REF=self.getReferrerUserStatus()
                r = ReferrerUpdate()
                dest_office_id = None
                status = None
                if 'office_id' in params:
                    g = db.query("""
                        select office_id from office_addresses where id=%s
                        """,(params['office_id'],)
                    )
                    if len(g) < 1:
                        return {'success': False,'message': 'OFFICE_NOT_FOUND'}
                    dest_office_id = g[0]['office_id']
                rus_id = r.processRow(1,tosave,insid,sha256,db,dest_office_id=dest_office_id,status=status)
                # Hmm we shouldnt do this since it bypasses the accept/reject process. Commented out for now
                if False and 'office_id' in params:
                    db.update("""
                        insert into client_intake 
                            (user_id,date_of_accident,attny_name,languages_id,sha256,office_type_id) 
                            values (%s,%s,%s,%s,%s,%s)
                        """,(user_id,tosave['doa'],tosave['attny'],tosave['language'],sha256,params['office_type_id'])
                    )
                    ci = db.query("select LAST_INSERT_ID()")
                    ci = ci[0]['LAST_INSERT_ID()']
                    db.update("""
                        insert into client_intake_offices(
                            client_intake_id,office_id,office_addresses_id
                        ) values (%s,%s,%s)
                    """,(ci,dest_office_id,params['office_id'])
                    )
                    db.update("""
                        update referrer_users set client_intake_id = %s
                            where id = %s
                        """,(rus_id,ci)
                    )
                db.commit()
        except Exception as e:
            print(str(e))
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
            return {'success': False,'message': 'Error on line %s: %s' % (line,str(e))}
        return {'success': True}
