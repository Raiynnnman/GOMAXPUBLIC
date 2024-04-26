# coding=utf-8

import sys
import os
import random
import json
import unittest
import jwt
import base64
from nameparser import HumanName

sys.path.append(os.path.realpath(os.curdir))

from util import encryption
from util.Logging import Logging
from processing import Stripe
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class RegistrationsBase(SubmitDataRequest):

    def __init__(self):
        super().__init__()

class RegistrationUpdate(RegistrationsBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        # Check params
        params = args[1][0]
        RT = self.getRegistrationTypes()
        t = RT['Customer']
        if 'last_name' not in params:
            params['last_name'] = ''
        if 'first_name' not in params:
            params['first_name'] = ''
        if 'email' not in params:
            return {'success': True}
        if 'phone' not in params:
            params['phone'] = ''
        email = params['email'].lower()
        HAVE = False
        db = Query()
        l = db.query("""
            select id from users where lower(email) = lower(%s)
            """,(params['email'],)
        )
        for x in l:
            HAVE=True
        if HAVE:
            log.info("USER_ALREADY_EXISTS")
            return {'success': False,message:'USER_ALREADY_EXISTS'}
        db.update("""
            delete from registrations_tokens where 
                registrations_id in (select id from registrations 
                where lower(email) = %s)
            """,(params['email'],)
        )
        db.update("""
            delete from registrations where lower(email) = %s
            """,(params['email'],)
        )
        db.update("""
            insert into registrations (
                email,first_name,last_name,phone,registration_types_id,
                zipcode
            ) values
                (
                lower(%s),%s,%s,%s,%s,%s
            )
            """,(
                params['email'],params['first_name'],params['last_name'],
                params['phone'],t,params['zipcode']
            )
        )
        insid = db.query("select LAST_INSERT_ID()");
        insid = insid[0]['LAST_INSERT_ID()']
        val = encryption.encrypt(
            json.dumps({'i':insid,'e':email}),
            config.getKey("encryption_key")
        )
        val = base64.b64encode(val.encode('utf-8'))
        db.update("""
            insert into registrations_tokens(registrations_id,token) values 
                (%s,%s)
            """,(insid,val.decode('utf-8'))
        )
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/verify/%s" % (url,val.decode('utf-8')),
            '__BASE__':url
        } 
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        m = Mail()
        m.defer(email,"Registration with #PAIN","templates/mail/registration-verification.html",data)
        db.commit()
        return {'success': True}

class RegistrationVerify(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        params = args[1][0]
        if 'token' not in params:
            log.info("TOKEN_NOT_IN_PARAMS")
            return {'success':False,'message':'TOKEN_REQUIRED'}
        token = params['token']
        db = Query()
        OT = self.getOfficeTypes()
        ENT = self.getEntitlementIDs()
        PERM = self.getPermissionIDs()
        o = db.query("""
            select registrations_id from registrations_tokens where
            token = %s 
            """,(token,)
        )
        if len(o) < 1:
            log.info("TOKEN_NOT_FOUND")
            return {'success':False,'message':'TOKEN_NOT_FOUND'}
        myid = 0
        inid = 0
        inem = ''
        try:
            token = base64.b64decode(token.encode('utf-8'))
            myjson = encryption.decrypt(token,config.getKey("encryption_key"))
            myjson = json.loads(myjson)
            inis = myjson['i']
            myid = inis
            userid = 0
            inem = myjson['e'].lower()
            HAVE = False
            l = db.query("""
                select id from users where email = %s
                """,(inem,)
            )
            for t in l:
                HAVE=True
                userid = t['id']
            if not HAVE:
                l = db.query("""
                    select 
                        email,first_name,last_name,phone,zipcode
                    from 
                        registrations r
                    where
                        email = %s and verified = 0
                    """,(inem,))
                u = l[0]
                db.update("""
                    insert into users (email, first_name, last_name, phone, zipcode) values (%s,%s,%s,%s,%s)
                    """,(u['email'],u['first_name'],u['last_name'],u['phone'],u['zipcode'])
                )
                insid = db.query("select LAST_INSERT_ID()");
                insid = insid[0]['LAST_INSERT_ID()']
                userid = insid
                offname = "user-%s" % encryption.getSHA256(u['email'])[:10]
                db.update("insert into office (name,office_type_id) values (%s,%s)",
                    (
                        offname,
                        OT['Customer']
                    )
                )
                offid = db.query("select LAST_INSERT_ID()");
                offid = offid[0]['LAST_INSERT_ID()']
                db.update("""
                    insert into office_history(office_id,user_id,text) values (
                        %s,1,'Created (Customer Registration)'
                    )
                """,(offid,))
                db.update("insert into office_addresses (office_id,zipcode) values (%s,%s)",
                    (offid,u['zipcode'])
                )
                db.update("insert into office_user (office_id,user_id) values (%s,%s)",
                    (offid,insid)
                )
                db.update("insert into user_entitlements(user_id,entitlements_id) values (%s,%s)",
                    (insid,ENT['Customer'])
                )
                db.update("insert into user_permissions(user_id,permissions_id) values (%s,%s)",
                    (insid,PERM['Write'])
                )
            db.update("""
                update registrations set user_id = %s where id = %s
                """,(userid,inis)
            )
            db.update("""
                insert into user_login_tokens (user_id,token,expires) values
                    (%s,%s,date_add(now(),INTERVAL 24 HOUR))
                """,(userid,params['token'])
            )
            db.update("""
                update registrations set verified = 1 where id=%s
                """,(myid,)
            )
            db.commit()
        except Exception as e:
            log.info("TOKEN_INVALID: %s" % str(e))
            return {'success':False,'message':'INVALID_TOKEN'}
        return { 'success': True }

class RegistrationLandingData(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {'pricing':[]}
        params = args[1][0]
        db = Query()
        q = """
            select 
                p.id, p.trial, p.price,
                p.locations, p.duration,p.upfront_cost,
                p.description,p.toshow,
                p.start_date,p.end_date,p.active,p.slot
            from
                pricing_data p
            """
        p = []
        if 'type' in params and params['type'] is not None:
            q += " where office_type_id = %s " 
            p = [params['type']]
        q += """
            order by 
                slot asc,
                start_date desc
            """
        j = []
        o = db.query(q,p)
        ret['pricing'] = []
        for x in o:
            x['benefits'] = db.query("""
                select
                        id,
                        description,
                        slot
                from 
                    pricing_data_benefits where 
                pricing_data_id = %s
                order by slot
                """,(x['id'],)
            )
            x['coupons'] = db.query("""
                select 
                        c.id,
                        c.name,
                        c.total,
                        c.perc,
                        c.reduction
                from coupons c
                    where pricing_data_id=%s
                """,(x['id'],)
            )
            ret['pricing'].append(x)
        l = db.query("""
            select ot.id,otd.name,otd.description,otd.signup_description
            from 
                office_type ot, office_type_descriptions otd
            where 
                otd.office_type_id = ot.id
            """)
        ret['roles'] = l
        ret['introduction'] = db.query("""
            select url,slot from landing_configuration
            where active = 1
            order by slot
        """)
        if 'pq_id' in params and params['pq_id'] is not None:
            o = db.query("""
                select
                    pq.id,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id',oa.id,'addr1',oa.addr1,'addr2',oa.addr2,'phone',oa.phone,
                            'city',oa.city,'state',oa.state,'zipcode',oa.zipcode,'verified','1')
                    ) as addr,u.phone,u.first_name,u.last_name,o.name,o.active,o.email,
                    op.pricing_data_id as plan
                from
                    provider_queue pq
                    left join office o on pq.office_id = o.id
                    left join office_plans op on op.office_id = o.id
                    left join users u on u.id = o.user_id 
                    left outer join office_addresses oa on oa.office_id = o.id
                where 
                    pq.id = %s
                group by
                    o.id
                """,(params['pq_id'],)
            )
            if len(o) > 0:
                o = o[0]
                addr = []
                o['addr'] = json.loads(o['addr'])
                for x in o['addr']:
                    if x['id'] is None:
                        continue
                    addr.append(x)
                o['addr'] = addr
                ret['pq'] = o
        return ret

class RegisterProvider(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        ret['success'] = True
        params = args[1][0]
        db = Query()
        RT = self.getRegistrationTypes()
        OT = self.getOfficeTypes()
        ST = self.getLeadStrength()
        ENT = self.getEntitlementIDs()
        PERM = self.getPermissionIDs()
        PL = self.getPlans()
        PQ = self.getProviderQueueStatus()
        BS = self.getBillingSystem()
        HAVE = False
        off_id = 0
        userid = 0
        pq_id = 0
        if 'cust_id' not in params:
            params['cust_id'] = "cust-%s" % (encryption.getSHA256(params['email']))
        if 'phone' in params and params['phone'] is not None:
            p = params['phone'].replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
            if p.startswith("+1"):
                p = p.replace("+1","")
            if p.startswith("1") and len(p) == 11:
                p = p[1:]
            params['phone'] = p

        l = db.query("""
            select id as a from users where email=lower(%s)
            UNION ALL
            select ou.user_id as a from 
                office o,office_addresses oa,office_user ou
             where 
                o.id=oa.office_id and o.id = ou.office_id
                and o.email=lower(%s)
            UNION ALL
            select ou.user_id as a from 
                office o,office_addresses oa,office_user ou
             where 
                o.id=oa.office_id and o.id = ou.office_id
                and oa.phone=%s
            """,(params['email'],params['email'],params['phone'])
        )
        for t in l:
            HAVE=True
            userid = t['a']
        if 'pq_id' in params and params['pq_id'] is not None:
            HAVE = True
            pq_id = int(params['pq_id'])
            l = db.query("""
                select office_id from provider_queue where id=%s
                """,(pq_id,)
            )
            off_id = l[0]['office_id']
        if off_id == 0:
            l = db.query("""
                select id 
                    from office o, office_user ou 
                where
                    ou.office_id=o.id and
                    ou.user_id = %s
                """,(userid,)
            )
            for t in l:
                off_id = t['id']
        provtype = OT['Chiropractor']
        if 'provtype' in params and params['provtype'] is not None:
            provtype = params['provtype']
        if off_id == 0:
            db.update("insert into office (name,office_type_id,email,cust_id,active,billing_system_id) values (%s,%s,%s,%s,0,%s)",
                (params['name'],provtype,params['email'].lower(),params['cust_id'],BS)
            )
            off_id = db.query("select LAST_INSERT_ID()");
            off_id = off_id[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,1,'Created (Registration)'
                )
            """,(off_id,))
        db.update("delete from office_addresses where office_id=%s",(off_id,))
        if 'addresses' not in params or len(params['addresses']) < 1 and \
            'zipcode' in params:
            db.update(
                """
                    insert into office_addresses (
                        office_id,name,zipcode
                    ) values (%s,%s,%s)
                """,(off_id,params['name'],params['zipcode'])
            )
        for x in params['addresses']:
            db.update(
                """
                    insert into office_addresses (
                        office_id,name,addr1,phone,city,state,zipcode
                    ) values (%s,%s,%s,%s,%s,%s,%s)
                """,(off_id,x['name'],x['addr1'],x['phone'],x['city'],x['state'],x['zipcode'])
            )
            oaid = db.query("select LAST_INSERT_ID()");
            oaid = oaid[0]['LAST_INSERT_ID()']
            if 'fulladdr' in x:
                db.update("update office_addresses set full_addr=%s where id=%s",(
                    x['fulladdr'],oaid)
                )
            if 'places_id' in x:
                db.update("update office_addresses set places_id=%s where id=%s",(
                    x['places_id'],oaid)
                )
        if not HAVE:
            db.update(
                """
                insert into provider_queue (office_id,provider_queue_lead_strength_id) 
                    values (%s,%s)
                """,(off_id,ST['Potential Provider'])
            )
            pq_id = db.query("select LAST_INSERT_ID()");
            pq_id = pq_id[0]['LAST_INSERT_ID()']
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Created (Registration)'
                )
            """,(pq_id,))
            l = db.query("""
                select id from users where lower(email) = lower(%s)
                """,(params['email'],)
            )
            uid = 0
            for o in l:
                uid = o['id']
            if uid == 0:
                n = HumanName(params['first'])    
                params['first'] = "%s %s" % (n.title,n.first)
                params['last'] = "%s %s" % (n.last,n.suffix)
                db.update(
                    """
                    insert into users (first_name,last_name,email,phone) values (%s,%s,%s,%s)
                    """,(params['first'],params['last'],params['email'].lower(),params['phone'])
                )
                uid = db.query("select LAST_INSERT_ID()");
                uid = uid[0]['LAST_INSERT_ID()']
            db.update("""
                update office set user_id=%s where id=%s
                """,(uid,off_id)
            )
            db.update("""
                insert into office_user (office_id,user_id) values (%s,%s)
                """,(off_id,uid)
            )
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
                """,(uid,ENT['Provider'])
            )
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
                """,(uid,ENT['OfficeAdmin'])
            )
            db.update("""
                insert into user_permissions (user_id,permissions_id) values (%s,%s)
                """,(uid,PERM['Admin'])
            )
            userid = uid
        db.update("""
            update provider_queue set updated=now() where office_id=%s
            """,(off_id,)
        )
        if 'plan' in params and params['plan'] is not None:
            if 'pq' not in params or params['pq'] is None:
                selplan = int(params['plan'])
                o = db.query("""
                    select id from office_plans where office_id = %s
                    """,(off_id,)
                )
                i = db.query("""
                    select id from invoices where office_id = %s
                    """,(off_id,)
                )
                if len(o) > 0 and len(i) < 1:
                    db.update("""
                        delete from office_plan_items opi
                            where opi.office_plans_id = %s
                        """,(o[0]['id'],)
                    )
                    db.update("""
                        delete from office_plans op
                            where op.office_id = %s
                        """,(off_id,)
                    )
                db.update("""
                    insert into office_plans (office_id,start_date,end_date,pricing_data_id) 
                        values (%s,now(),date_add(now(),INTERVAL %s MONTH),%s)
                    """,(off_id,PL[selplan]['duration'],selplan)
                )
                planid = db.query("select LAST_INSERT_ID()");
                planid = planid[0]['LAST_INSERT_ID()']
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
                        """,(planid,params['coupon_id'])
                    )
                    coup = db.query("""
                        select total,perc,reduction,name from coupons where id = %s
                        """,(params['coupon_id'],)
                    )
                    if len(coup) > 0:
                        coup = coup[0]
                        val = 0
                        if coup['total'] is not None:
                            val = PL[selplan]['price'] * PL[selplan]['duration']
                            val = val - coup['total']
                        if coup['perc'] is not None:
                            val = PL[selplan]['price'] * PL[selplan]['duration']
                            val = val * coup['perc']
                        if coup['reduction'] is not None:
                            val = PL[selplan]['price'] * PL[selplan]['duration']
                            val = val - coup['reduction']
                        db.update("""
                            insert into office_plan_items (
                                office_plans_id,price,quantity,description) 
                            values 
                                (%s,%s,%s,%s)
                            """,(planid,-val,1,coup['name'])
                                
                        )
                db.update("""
                    insert into office_history(office_id,user_id,text) values (
                        %s,1,'Created Plan'
                    )
                """,(off_id,))
        if 'card' in params and params['card'] is not None:
            stripe_id = None
            if BS == 1:
                cust_id = params['cust_id']
                card = params['card']['card']
                self.saveStripe(cust_id,card)
                l = db.query("""
                    select stripe_key from setupIntents where uuid=%s
                """,(cust_id,))
                stripe_id = l[0]['stripe_key']
                db.update("""
                    update office set stripe_cust_id=%s where id=%s
                    """,(stripe_id,insid)
                )
                st = Stripe.Stripe()
                pid = st.confirmCard(params['intentid'],cust_id,stripe_id)
                db.update("""
                    insert into office_cards(
                        office_id,card_id,last4,exp_month,
                        exp_year,client_ip,payment_id,
                        address1,address2,state,city,zip,name,
                        is_default
                    ) values (
                        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1
                    )
                    """,(off_id,card['id'],card['last4'],
                         card['exp_month'],card['exp_year'],
                         params['card']['client_ip'],pid['payment_method'],card['address_line1'],
                         card['address_line2'],card['address_state'],card['address_city'],
                         card['address_zip'],card['name']
                    )
                )
            elif BS == 2:
                card = params['card']
                db.update("""
                    insert into office_cards(
                        office_id,card_id,payment_id,last4,
                        exp_month,exp_year,is_default,brand
                    ) values (%s,%s,%s,%s,%s,%s,1,%s)
                    """,(
                        off_id,
                        card['token']['token'],
                        card['token']['token'],
                        card['token']['details']['card']['last4'],
                        card['token']['details']['card']['expMonth'],
                        card['token']['details']['card']['expYear'],
                        card['token']['details']['card']['brand']
                        )
                )
        if 'pq_id' in params and params['pq_id'] is not None: 
            db.update("""
                update provider_queue set 
                sf_lead_executed=1,
                provider_queue_status_id = %s where id = %s
                """,(PQ['INVITED'],pq_id)
            )
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'User Registered, Set to INVITED (SF Lead Registration)'
                )
            """,(params['pq_id'],))
            db.update("""
                update office set active = 1,import_sf=1 where id = %s
                """,(off_id,)
            )
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,1,'Set to active (SF Lead Registration)'
                )
            """,(off_id,))
        self.setJenkinsID(off_id)
        db.update("""
            delete from registrations_tokens where 
                registrations_id in (select id from registrations 
                where lower(email) = %s)
            """,(params['email'],)
        )
        db.update("""
            delete from registrations where lower(email) = %s
            """,(params['email'],)
        )
        db.update("""
            insert into registrations (
                email,first_name,last_name,phone,registration_types_id
            ) values
                (
                lower(%s),%s,%s,%s,%s
            )
            """,(
                params['email'].lower(),params['first'],params['last'],
                params['phone'],RT['Provider']
            )
        )
        email = params['email'].lower()
        insid = db.query("select LAST_INSERT_ID()");
        insid = insid[0]['LAST_INSERT_ID()']
        val = encryption.encrypt(
            json.dumps({'i':insid,'e':email}),
            config.getKey("encryption_key")
        )
        val = base64.b64encode(val.encode('utf-8'))
        db.update("""
            insert into registrations_tokens(registrations_id,token) values 
                (%s,%s)
            """,(insid,val.decode('utf-8'))
        )
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/verify/%s" % (url,val.decode('utf-8')),
            '__BASE__':url
        } 
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        m = Mail()
        m.defer(email,"Registration with #PAIN","templates/mail/registration-verification.html",data)
        db.commit()
        return ret

class RegistrationSetupIntent(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        st = Stripe.Stripe()    
        db = Query()
        uuid = "cust_%s" % encryption.getSHA256()
        cust_id = st.createCustomer(uuid)
        ret = st.setupIntent(cust_id,uuid)
        ret['cust_id'] = uuid
        db.update("""
            insert into setupIntents (uuid,stripe_key) values (%s,%s)
        """,(uuid,cust_id)
        )
        db.commit()
        return ret


class RegistrationSearchProvider(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        params = args[1][0]
        st = encryption.getSHA256()
        if isinstance(params,list):
            params = params[0]
        if 'p' not in params or len(params['p']) < 1:
            params['p'] = st
        if 'e' not in params or len(params['e']) < 1:
            params['e'] = st
        params['p'] = params['p'].replace('-','')
        params['p'] = params['p'].replace(' ','')
        params['p'] = params['p'].replace(')','')
        params['p'] = params['p'].replace('(','')
        if 'n' not in params:
            params['n'] = ''
        o = db.query("""
            select distinct office_id from (
                select id as office_id from office where 
                    active = 0 and
                    (lower(name) like lower(%s)  or lower(email) like lower(%s))
                UNION ALL
                select office_id from office_addresses oa,office o where 
                    o.id = oa.office_id and o.active = 0 and
                    (lower(oa.name) like  lower(%s)  or oa.phone like %s)) as t 
            limit 10
            """,(
                '%%' + params['n'] + '%%','%%' + params['e'] + '%%',
                '%%' + params['n'] + '%%','%%' + params['p'] + '%%'
                )
        )
        if len(o) < 1:
            ret['potentials'] = []
            return ret
        if len(o) > 10:
            ret['potentials'] = []
            return ret
        pots = []
        for j in o:
            t = db.query("""
                select id,name,addr1,city,
                    CONCAT('(',SUBSTR(phone,1,3), ') ', SUBSTR(phone,4,3), '-', SUBSTR(phone,7,4)) as phone,
                    state,zipcode,0 as verified from
                    office_addresses where
                    office_id = %s 
                """,(j['office_id'],)
            )
            g = pots + t
            pots = g

        ret['potentials'] = pots
        return ret

class RegisterReferrer(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        ret['success'] = True
        params = args[1][0]
        db = Query()
        insid = 0
        RT = self.getRegistrationTypes()
        OT = self.getOfficeTypes()
        ST = self.getLeadStrength()
        ENT = self.getEntitlementIDs()
        PERM = self.getPermissionIDs()
        PL = self.getPlans()
        BS = self.getBillingSystem()
        HAVE = False
        userid = 0
        l = db.query("""
            select id from users where email=lower(%s)
            """,(params['email'],)
        )
        if len(l) > 0:
            log.info("Already have %s in referrers" % params['email'])
            return {'success': True}
        l = db.query("""
            select id 
                from office o, office_user ou 
            where
                ou.office_id=o.id and
                ou.user_id = %s
            """,(userid,)
        )
        for t in l:
            insid = t['id']
        params['phone'] = params['phone'].replace(')','').replace('(','').replace('-','').replace(' ','')
        if insid == 0:
            db.update("insert into office (name,office_type_id,email,active) values (%s,%s,%s,0)",
                (params['name'],OT['Referrer'],params['email'].lower())
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_addresses (office_id,phone) values
                    (%s,%s)
                """,(insid,params['phone'])
            )
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,1,'Created (Referrer Registration)'
                )
            """,(insid,))
        if not HAVE:
            db.update(
                """
                insert into provider_queue (office_id,provider_queue_lead_strength_id) 
                    values (%s,%s)
                """,(insid,ST['Potential Provider'])
            )
            l = db.query("""
                select id from users where email = %s
                """,(params['email'].lower(),)
            )
            uid = 0
            for o in l:
                uid = o['id']
            if uid == 0:
                db.update(
                    """
                    insert into users (first_name,last_name,email,phone) values (%s,%s,%s,%s)
                    """,(params['first'],params['last'],params['email'].lower(),params['phone'])
                )
                uid = db.query("select LAST_INSERT_ID()");
                uid = uid[0]['LAST_INSERT_ID()']
            db.update("""
                update office set user_id=%s where id=%s
                """,(uid,insid)
            )
            db.update("""
                insert into office_user (office_id,user_id) values (%s,%s)
                """,(insid,uid)
            )
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
                """,(uid,ENT['Referrer'])
            )
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
                """,(uid,ENT['OfficeAdmin'])
            )
            db.update("""
                insert into user_permissions (user_id,permissions_id) values (%s,%s)
                """,(uid,PERM['Admin'])
            )
        db.update("""
            delete from registrations_tokens where 
                registrations_id in (select id from registrations 
                where lower(email) = %s)
            """,(params['email'],)
        )
        db.update("""
            delete from registrations where lower(email) = %s
            """,(params['email'],)
        )
        db.update("""
            insert into registrations (
                email,first_name,last_name,phone,registration_types_id
            ) values
                (
                lower(%s),%s,%s,%s,%s
            )
            """,(
                params['email'],params['first'],params['last'],
                params['phone'],RT['Provider']
            )
        )
        email = params['email'].lower()
        insid = db.query("select LAST_INSERT_ID()");
        insid = insid[0]['LAST_INSERT_ID()']
        val = encryption.encrypt(
            json.dumps({'i':insid,'e':email}),
            config.getKey("encryption_key")
        )
        val = base64.b64encode(val.encode('utf-8'))
        db.update("""
            insert into registrations_tokens(registrations_id,token) values 
                (%s,%s)
            """,(insid,val.decode('utf-8'))
        )
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/verify/%s" % (url,val.decode('utf-8')),
            '__BASE__':url
        } 
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        m = Mail()
        m.defer(email,"Registration with #PAIN","templates/mail/registration-verification.html",data)
        db.commit()
        return ret
