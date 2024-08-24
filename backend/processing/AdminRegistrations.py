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

    def processRow(self,params,user,db):
        PQS = self.getProviderQueueStatus()
        ALT = self.getAltStatus()
        INV = self.getInvoiceIDs()
        ENT = self.getEntitlementIDs()
        PERM = self.getPermissionIDs()
        BS = self.getBillingSystem()
        OT = self.getOfficeTypes()
        PL = self.getPlans()
        STR = self.getLeadStrength()
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
            """,(params['do_not_contact'],offid,)
            )
        if 'first_name' in params:
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
        if 'website' in params:
            db.update("""
                update provider_queue set website=%s where office_id = %s
                """,(params['website'],params['office_id'])
            )
        if 'provider_queue_status_id' not in params:
            params['provider_queue_status_id'] = None
        db.update("""
            update provider_queue set 
                provider_queue_status_id=%s,
                provider_queue_lead_strength_id=%s,
                initial_payment=%s,updated=now()
            where 
                office_id = %s
            """,(params['provider_queue_status_id'],params['lead_strength_id'],
                 params['initial_payment'],offid)
        )
        if 'commission_user_id' in params:
            db.update("""
                update office set commission_user_id=%s where id=%s
                """,(params['commission_user_id'],offid)
            )
        if 'provider_queue_presented_status_id' in params:
            db.update("""
                update provider_queue set provider_queue_presented_status_id=%s where office_id=%s
                """,(params['provider_queue_presented_status_id'],offid)
            )
        if 'provider_queue_source_id' in params:
            db.update("""
                update provider_queue set provider_queue_source_id=%s where office_id=%s
                """,(params['provider_queue_source_id'],offid)
            )
        if 'set_date' in params:
            db.update("""
                update provider_queue set set_date=%s where office_id=%s
                """,(params['set_date'],offid)
            )
        if 'present_date' in params:
            db.update("""
                update provider_queue set present_date=%s where office_id=%s
                """,(params['present_date'],offid)
            )
        if 'estimated_close_date' in params:
            db.update("""
                update provider_queue set estimated_close_date=%s where office_id=%s
                """,(params['estimated_close_date'],offid)
            )
        if 'closed_date' in params:
            db.update("""
                update provider_queue set closed_date=%s where office_id=%s
                """,(params['closed_date'],offid)
            )
        if 'set_to_present_date' in params:
            db.update("""
                update provider_queue set set_to_present_date=%s where office_id=%s
                """,(params['set_to_present_date'],offid)
            )
        if 'business_name' in params:
            db.update("""
                update provider_queue set business_name=%s where office_id=%s
                """,(params['business_name'],offid)
            )
        if 'doing_business_as_name' in params:
            db.update("""
                update provider_queue set doing_business_as_name=%s where office_id=%s
                """,(params['doing_business_as_name'],offid)
            )
        if 'presentation_result' in params:
            db.update("""
                update provider_queue set presentation_result=%s where office_id=%s
                """,(params['presentation_result'],offid)
            )
        if 'deal_value' in params:
            db.update("""
                update provider_queue set deal_value=%s where office_id=%s
                """,(params['deal_value'],offid)
            )
        if 'include_on_deal_tracker' in params:
            db.update("""
                update provider_queue set 
                include_on_deal_tracker=%s,
                start_tracker_date=now()
                 where office_id=%s
                """,(params['include_on_deal_tracker'],offid)
            )
        if 'close_requirements' in params:
            db.update("""
                update provider_queue set close_requirements=%s where office_id=%s
                """,(params['close_requirements'],offid)
            )
        if 'refund_requested' in params:
            db.update("""
                update provider_queue set refund_requested=%s where office_id=%s
                """,(params['refund_requested'],offid)
            )
        if 'setter_user_id' in params:
            db.update("""
                update office set setter_user_id=%s where id=%s
                """,(params['setter_user_id'],offid)
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
                if 'attendees' not in x:
                    x['attendees'] = []
                if 'body' not in x:
                    x['body'] = {}
                if 'subject' not in x:
                    x['subject'] = None
                if 'action_type_id' not in x:
                    x['action_type_id'] = None
                if 'action_status_id' not in x:
                    x['action_status_id'] = None
                if 'server_response' not in x:
                    x['server_response'] = {}
                if 'start' not in x:
                    x['start'] = {'dateTime':'','timeZone':''}
                if 'end' not in x:
                    x['end'] = {'dateTime':'','timeZone':''}
                if 'id' in x and x['id'] == 'new':
                    del x['id']
                x['start_timezone'] = ''
                x['end_timezone'] = ''
                x['online'] = 0
                if 'isOnlinMeeting' in x:
                    x['online'] = x['isOnlineMeeting']
                if 'dateTime' in x['start']:
                    x['start_timezone'] = x['start']['timeZone']
                    x['start'] = x['start']['dateTime']
                if 'dateTime' in x['end']:
                    x['end_timezone'] = x['end']['timeZone']
                    x['end'] = x['end']['dateTime']
                if 'id' not in x:
                    db.update("""
                        insert into provider_queue_actions(
                            user_id,provider_queue_id,body,subject,attendees,
                            start_date,end_date,online,start_timezone,end_timezone,
                            provider_queue_actions_type_id,server_response,
                            provider_queue_actions_status_id
                        )
                        values 
                        (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                        """,(user['user_id'],
                            pqid,json.dumps(x['body']),x['subject'],
                            json.dumps(x['attendees']),
                            x['start'],x['end'],x['online'],x['start_timezone'],
                            x['end_timezone'],x['action_type_id'],
                            json.dumps(x['server_response']),
                            x['action_status_id'])
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
        if 'emails' in params and params['emails'] is not None:
            for a in params['emails']:
                if 'id' in a and a['id'] is not None:
                    db.update("""
                        update office_email set 
                          description=%s,email=%s
                        where id=%s
                        """,(
                            a['description'],a['email'],a['id']
                        )
                    )
                    if 'deleted' in x and x['deleted']:
                        db.update("""
                            update office_email set deleted=1 where id=%s
                        """,(a['id'],)
                        )
                else:
                    db.update(
                        """
                            insert into office_email (
                                office_id,description,email
                            ) values (%s,%s,%s)
                        """,(offid,x['description'],x['email'],)
                    )
        if 'phones' in params and params['phones'] is not None:
            for a in params['phones']:
                if 'id' in a and a['id'] is not None:
                    db.update("""
                        update office_phones set 
                          description=%s,phone=%s,iscell=%s
                        where id=%s
                        """,(
                            a['description'],a['phone'],a['iscell'],a['id']
                        )
                    )
                    if 'deleted' in x and x['deleted']:
                        db.update("""
                            update office_phones set deleted=1 where id=%s
                        """,(a['id'],)
                        )
                else:
                    db.update(
                        """
                            insert into office_phones (
                                office_id,description,phone,iscell
                            ) values (%s,%s,%s)
                        """,(offid,x['description'],x['phone'],x['iscell'])
                    )
        if 'addr' in params and params['addr'] is not None:
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
        if params['provider_queue_status_id'] == PQS['APPROVED'] or params['provider_queue_status_id'] == PQS['IN_NETWORK']:
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
            """,(PQS['IN_NETWORK'],offid)
            )
            u = db.query("""
                select u.id,u.email  from users u,office_user ou
                    where u.id=ou.user_id and ou.office_id=%s
                """,(offid,)
            )
            # TODO: Send welcome mail here
            #if len(u) > 0:
            #    we = WelcomeEmailReset()
            #    we.execute(0,[{'email': u[0]['email']}])
        db.commit()

    @check_crm
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        if 'bulk' in params:
            for g in params['bulk']:
                self.processRow(g,user,db);
        else:
            self.processRow(params,user,db);
        return {'success':True}

class RegistrationList(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def populateValues(self,entry,db):
        x = entry
        x['additional_emails'] = db.query("""
            select id,description,email from office_emails
                where office_id = %s and deleted = 0
            """,(x['office_id'],)
        )
        x['phones'] = db.query("""
            select id,description,iscell,phone from office_phones 
                where office_id = %s and deleted = 0
            """,(x['office_id'],)
        )
        if 'office_hours' in x and x['office_hours'] is not None:
            x['office_hours'] = json.loads(x['office_hours'])
        else:
            x['office_hours'] = []
        x['actions']  = []
        acts = db.query("""
            select pqa.id,pqa.user_id,
            pqat.name as action_type,pqat.id as action_type_id,
            pqas.name as action_status, pqas.id as action_status_id,
            concat(u.first_name, ' ', u.last_name) as activity_name,
            pqa.duration,pqa.due_date,pqa.end_date,pqa.start_date,pqa.attendees,
            pqa.body,pqa.subject,pqa.server_response
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
            try:
                cc['server_response'] = json.loads(cc['server_response'])
                cc['body'] = json.loads(cc['body'])
                cc['attendees'] = json.loads(cc['attendees'])
                x['actions'].append(cc)
            except Exception as e:
                print("ERROR: ACTS: %s" % str(e))
                print(cc)
        x['addr'] = db.query("""
            select 
                ou.addr1,ou.addr2,ou.city,ou.state,ou.zipcode,ou.phone
            from 
                office_addresses ou
            where 
                office_id=%s
            """,(x['office_id'],)
        )
        x['zipcode'] = x['city'] = x['state'] = 'N/A'
        if len(x['addr']) > 0:
            x['zipcode'] = x['addr'][0]['zipcode']
            x['city'] = x['addr'][0]['city']
            x['state'] = x['addr'][0]['state']
        x['assignee'] = db.query("""
            select
                u.id,u.first_name,u.last_name
            from users u
            where id in
            (select user_id
                from user_entitlements ue,entitlements e
                where ue.entitlements_id=e.id and e.name='CRMUser')
            UNION ALL
            select
                u.id,u.first_name,u.last_name
            from users u
            where id in
            (select user_id
                from user_entitlements ue,entitlements e
                where ue.entitlements_id=e.id and e.name='Admin')
            UNION ALL
            select 1,'System',''
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
        x['users'] = db.query("""
            select u.first_name,u.email,u.last_name,u.phone,u.id
            from users u
            left join office_user ou on u.id = ou.user_id
            where 
            ou.office_id = %s
            """,(x['office_id'],)
        )
        x['last_name'] = x['users'][0]['last_name'] if len(x['users']) > 0 else ''
        x['first_name'] = x['users'][0]['first_name'] if len(x['users']) > 0 else ''
        x['phone'] = x['users'][0]['phone'] if len(x['users']) > 0 else ''
        x['email'] = x['users'][0]['email'] if len(x['users']) > 0 else ''
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
        return x

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
        PQS = self.getProviderQueueStatus()
        db = Query()
        ALT = self.getAltStatus()
        q = """
            select 
                pq.id,o.id as office_id,o.name,o.email,pqs.name as status,
                concat('=hyperlink("https://login.poundpain.com/app/main/admin/registrations/',pq.id,'"),"LINK")') as url,
                pq.provider_queue_status_id,pq.sm_id,pqls.name as lead_strength,
                pqls.id as lead_strength_id, pq.created,pq.updated,pq.places_id,
                pq.initial_payment,ot.id as office_type_id,pq.tags,
                pqcs.name as call_status, pqcs.id as call_status_id,
                ot.name as office_type,op.pricing_data_id as pricing_id,
                pq.do_not_contact,pq.website,
                o.setter_user_id,o.open_saturday,o.office_hours,
                o.commission_user_id,oa.state,op.start_date,
                concat(comu.first_name, ' ', comu.last_name) as commission_name,
                concat(setu.first_name, ' ', setu.last_name) as setter_name,
                comu.email as commission_email,
                coup.id as coupon_id,coup.name as coupon_name,pqqs.name as source_name,
                pqps.name as presented_status_name,pq.presentation_result,
                pq.set_date,pq.present_date,pq.estimated_close_date,
                ifnull(pq.close_requirements,'') as close_requirements, pq.closed_date,
                pq.refund_requested,pq.set_to_present_date, pq.business_name, pq.doing_business_as_name,
                pq.include_on_deal_tracker,pq.provider_queue_source_id,
                pq.provider_queue_presented_status_id,pq.deal_value,
                timestampdiff(day, pq.closed_date, now()) as closed_days
            from
                provider_queue pq
                left join office o on pq.office_id = o.id
                left outer join office_addresses oa on oa.office_id = o.id 
                left outer join provider_queue_presented_status pqps on pq.provider_queue_presented_status_id = pqps.id
                left outer join provider_queue_source pqqs on pqqs.id = pq.provider_queue_source_id
                left outer join provider_queue_call_status pqcs on pq.provider_queue_call_status_id=pqcs.id
                left outer join provider_queue_status pqs on pqs.id=pq.provider_queue_status_id
                left outer join provider_queue_lead_strength pqls on pq.provider_queue_lead_strength_id=pqls.id
                left outer join office_plans op on op.office_id = o.id
                left outer join coupons coup on coup.id = op.coupons_id
                left outer join office_type ot on ot.id=o.office_type_id
                left outer join office_user ou on ou.office_id = o.id
                left outer join office_phones opp on opp.office_id = o.id
                left outer join users off_u on off_u.id = ou.user_id
                left outer join users comu on comu.id = o.commission_user_id
                left outer join users setu on setu.id = o.setter_user_id
            where
                1 = 1 
        """
        prefilter = q
        deal_tracker = q
        status_ids = []
        search_par = []
        ret['sort'] = [
            {'id':1,'col':'updated','active':False,'direction':'asc'},
            {'id':2,'col':'name','active':False,'direction':'asc'}
        ]
        count_par = []
        if 'pq_id' in params and params['pq_id'] is not None and int(params['pq_id']) > 0:
            q += " and pq.id = %s "
            search_par.insert(0,int(params['pq_id']))
            count_par.append(int(params['pq_id']))
        else:
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
                    q += """ and (
                        opp.phone like %s or o.email like %s  or o.name like %s
                        or pq.business_name like %s or pq.doing_business_as_name like %s
                        or off_u.last_name like %s or off_u.first_name like %s
                        or oa.name like %s
                        ) 
                    """
                    search_par.insert(0,params['search']+'%%')
                    search_par.insert(0,params['search']+'%%')
                    search_par.insert(0,params['search']+'%%')
                    search_par.insert(0,params['search']+'%%')
                    search_par.insert(0,params['search']+'%%')
                    search_par.insert(0,params['search']+'%%')
                    search_par.insert(0,params['search']+'%%')
                    search_par.insert(0,params['search']+'%%')
                    count_par.insert(0,params['search']+'%%')
                    count_par.insert(0,params['search']+'%%')
                    count_par.insert(0,params['search']+'%%')
                    count_par.insert(0,params['search']+'%%')
                    count_par.insert(0,params['search']+'%%')
                    count_par.insert(0,params['search']+'%%')
                    count_par.insert(0,params['search']+'%%')
                    count_par.insert(0,params['search']+'%%')
            else:
                if 'mine' in params and params['mine'] is not None:
                    q += " and ( o.commission_user_id = %s or o.setter_user_id = %s )"
                    search_par.insert(0,user['id'])
                    count_par.append(user['id'])
                    search_par.insert(0,user['id'])
                    count_par.append(user['id'])
                if 'open_saturday' in params and params['open_saturday'] is not None:
                    q += " and open_saturday = "
                    search_par.append(params['open_saturday'])
                    count_par.append(params['open_saturday'])
                if 'status' in params and len(params['status']) > 0:
                    q += " and provider_queue_status_id in ("
                    arr = []
                    for z in params['status']:
                        arr.append(z)
                    q += ",".join(map(str,arr))
                    q += ")"
                if 'mine' in params and params['mine'] is not None and params['mine']: # Delete users if mine is True
                    params['users'] = [user['id']]
                if 'users' in params and params['users'] is not None and len(params['users']) > 0: 
                    q += " and ("
                    arr = []
                    for z in params['users']:
                        if z == str(0) or z == 0:
                            arr.append("o.commission_user_id is null")
                        else:
                            arr.append("o.commission_user_id = %s" % z)
                    q += " or ".join(map(str,arr))
                    q += ")"
                if 'type' not in params or len(params['type']) == 0:
                    params['type'] = [-1]
                if 'type' in params and params['type'] is not None and len(params['type']) > 0:
                    q += " and office_type_id in ("
                    arr = []
                    for z in params['type']:
                        arr.append(z)
                    q += ",".join(map(str,arr))
                    q += ")"
        prelimit = q
        pre_par = json.loads(json.dumps(search_par))
        q += " group by o.id "
        cnt = db.query("select count(id) as cnt from (" + q + ") as t", count_par)
        ret['total'] = cnt[0]['cnt']
        if 'sort' not in params or params['sort'] == None:
            q += """
                order by
                    id asc
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
        search_par.append(int(limit))
        search_par.append(int(offset)*int(limit))
        q += " limit %s offset %s " 
        o = []
        o = db.query(q,search_par)
        k = [] 
        dtrack = []
        dtrack_start = db.query(deal_tracker + " and pq.include_on_deal_tracker = 1 group by o.id")
        ret['deal_tracker'] = dtrack
        for x in o:
            x = self.populateValues(x,db)
            k.append(x)
        ret['registrations'] = k
        for x in dtrack_start:
            x = self.populateValues(x,db)
            dtrack.append(x)
        ret['config'] = {}
        ret['config']['type'] = db.query("select id,name from office_type where name <> 'Customer'")
        ret['config']['call_status'] = db.query("select id,name from provider_queue_call_status")
        ret['config']['action_status'] = db.query("select id,name from provider_queue_actions_status")
        ret['config']['action_type'] = db.query("select id,name from provider_queue_actions_type where id in (1,3)")
        ret['config']['states'] = db.query("select state,count(state) from office_addresses where length(state) > 0 group by state")
        ret['config']['status'] = db.query("select id,name from provider_queue_status")
        ret['config']['presented_status'] = db.query("select id,name from provider_queue_presented_status")
        ret['config']['deal_source'] = db.query("select id,name from provider_queue_source")
        ret['config']['coupons'] = db.query("select id,name,total,perc,reduction from coupons")
        ret['config']['commission_users'] = db.query("""
            select 0 as id,'Unassigned' as name
            UNION ALL
            select 1 as id,'System' as name
            UNION ALL
            select id,concat(first_name,' ',last_name) as name from users u
                where id in (select user_id from user_entitlements where entitlements_id=10)
            UNION ALL
            select id,concat(first_name,' ',last_name) as name from users u
                where id in (select user_id from user_entitlements where entitlements_id=14)
        """)
        ret['config']['strength'] = db.query("select id,name from provider_queue_lead_strength")
        ret['dashboard'] = {}
        ret['dashboard']['appointments'] = db.query("""
            select t1.num1 as num1 
            from 
            (select count(id) as num1 from provider_queue_actions where date(start_date) = date(now())) as t1
            """
        )
        ret['dashboard']['appointments'] = ret['dashboard']['appointments'][0]
        ret['dashboard']['presented'] = db.query("""
            WITH RECURSIVE t as (
                select date_add(now(),INTERVAL -7 day) as dt, 0 as count1
                UNION 
                 SELECT DATE_ADD(t.dt, INTERVAL 1 day) as month,
                 (select count(id) from provider_queue p
                    where 
                    day(t.dt)=day(p.set_to_present_date) and month(t.dt)=month(p.set_to_present_date) and 
                    year(t.dt)=year(p.set_to_present_date) 
                 ) as count1
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 DAY) <= date_add(now(),interval 1 day)
            )
            select date_format(date_add(dt,interval -1 day),'%a, %D') as label,round(ifnull(count1,0),2) as count FROM t ;
        """)
        ret['dashboard']['future_appointments'] = db.query("""
            WITH RECURSIVE t as (
                select date(now()) as dt, 0 as count1
                UNION 
                 SELECT DATE_ADD(t.dt, INTERVAL 1 day) as month,
                 (select count(id) from provider_queue_actions p
                    where 
                    day(t.dt)=day(p.start_date) and month(t.dt)=month(p.start_date) and 
                    year(t.dt)=year(p.start_date) 
                 ) as count1
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 DAY) <= date_add(now(),interval 7 day)
            )
            select date_format(date_add(dt,interval -1 day),'%a, %D') as label,round(ifnull(count1,0),2) as count FROM t ;
        """)
        ret['dashboard']['potential_sales'] = db.query("""
            WITH RECURSIVE t as (
                select date(now()) as dt, 0 as count1
                UNION 
                 SELECT DATE_ADD(t.dt, INTERVAL 1 day) as month,
                 (select sum(deal_value) from provider_queue p
                    where 
                    day(t.dt)=day(p.estimated_close_date) and month(t.dt)=month(p.estimated_close_date) and 
                    year(t.dt)=year(p.estimated_close_date) 
                 ) as count1
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 DAY) <= date_add(now(),interval 7 day)
            )
            select date_format(date_add(dt,interval -1 day),'%a, %D') as label,round(ifnull(count1,0),2) as count FROM t ;
        """)
        ret['dashboard']['week_sales'] = db.query("""
            WITH RECURSIVE t as (
                select date(date_add(now(),INTERVAL -7 day)) as dt,
                 (select sum(total) from invoices p
                    where 
                    day(date(date_add(now(),INTERVAL -7 day)))=day(p.created) 
                    and p.invoice_status_id=15 
                    and month(date(date_add(now(),INTERVAL -7 day)))=month(p.created) 
                    and year(date(date_add(now(),INTERVAL -7 day)))=year(p.created) 
                 ) as count1,
                 (select sum(total) from invoices p
                    where 
                    day(date(date_add(now(),INTERVAL -7 day)))=day(p.created) 
                    and p.invoice_status_id=15 
                    and month(date(date_add(now(),INTERVAL -7 day)))=month(p.created) 
                    and year(date(date_add(now(),INTERVAL -7 day)))=year(p.created) 
                 ) as count2
                UNION 
                 SELECT DATE_ADD(t.dt, INTERVAL 1 day) as month,
                 (select sum(total) from invoices p
                    where 
                    day(t.dt)=day(p.created) and month(t.dt)=month(p.created) and year(t.dt)=year(p.created) 
                    and p.invoice_status_id=15 
                 ) as count1,
                 (select sum(total) from invoices p
                    where 
                    day(t.dt)=day(p.created) and month(t.dt)=month(p.created) and year(t.dt)=year(p.created) 
                    and p.invoice_status_id=15 
                 ) as count2
                 FROM t
                 WHERE DATE_ADD(t.dt, INTERVAL 1 DAY) <= date_add(now(),interval 1 day)
            )
            select date_format(date_add(dt,interval -1 day),'%a, %D') as label,round(ifnull(count1,0),2) as count FROM t ;
            """)
        if 'report' in params and params['report'] is not None:
            myq = prelimit
            d = calcdate.getYearToday()
            ret['filename'] = 'provider_report-%s.csv' % d
            if 'dnc' in params and params['dnc']:
                ret['filename'] = 'dnc_list-%s.csv' % d
                myq = prefilter
                myq += "\n /* DNC */ and ("
                myq += " provider_queue_status_id = %s " % PQS['DO_NOT_CONTACT']
                myq += " or provider_queue_status_id = %s " % PQS['IN_NETWORK']
                myq += " or provider_queue_status_id = %s " % PQS['NOT_INTERESTED']
                myq += " or provider_queue_status_id = %s " % PQS['REQUIRES_RAIN']
                myq += " or provider_queue_status_id = %s " % PQS['REQUIRES_REFERENCE']
                myq += " or provider_queue_status_id = %s " % PQS['REQUIRES_PATIENT']
                myq += " or provider_queue_status_id = %s " % PQS['NOT_A_CHIROPRACTOR']
                myq += " or provider_queue_status_id = %s " % PQS['PAYMENT_COMMITTED']
                myq += " or provider_queue_status_id = %s " % PQS['WARMING']
                myq += " or provider_queue_status_id = %s " % PQS['RAIN_REQUIRED_TO_CLOSE']
                myq += ")\n"
                i = []
            myq += " group by o.id order by id desc "
            o = db.query(myq,pre_par)
            rep = []
            for x in o:
                x['additional_emails'] = []
                ae = db.query("""
                    select group_concat(oe.email) as ad 
                    from office_emails oe,office o,users u,office_user ou
                    where 
                        o.id = %s
                        and oe.office_id = o.id
                        and ou.office_id = o.id
                        and ou.user_id = u.id
                        and oe.email <> o.email and oe.email <> u.email
                    """,(x['office_id'],)
                )
                x['additional_emails'] = ae[0]['ad']
                rep.append(x)
            frame = pd.DataFrame.from_dict(rep)
            t = frame.to_csv()
            ret['content'] = base64.b64encode(t.encode('utf-8')).decode('utf-8')
        return ret

