# coding=utf-8

import sys
import os
import ipaddress
import uuid
import random
import json
import unittest
import jwt
import base64
import traceback
import stripe
from nameparser import HumanName
from flask import make_response, request, jsonify

sys.path.append(os.path.realpath(os.curdir))

from processing import OfficeReferrals
from square.client import Client
from util import encryption,calcdate
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
from processing.StaxxPayments import StaxxPayments
from processing import AdminTraffic

log = Logging()
config = settings.config()
config.read("settings.cfg")

key = config.getKey("square_api_key")
key = config.getKey("stripe_key")
stripe.api_key = key

client = None
if  config.getKey("environment") == 'prod':
    client = Client(access_token=key,environment='production')
else:
    client = Client(access_token=key,environment='sandbox')

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
            return {'success': False,"message":'USER_ALREADY_EXISTS'}
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
        if self.isUIV2(): 
            data['__LINK__']:"%s/verify/%s" % (url,val.decode('utf-8'))
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        m = Mail()
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Registration with POUNDPAIN TECH","templates/mail/registration-verification.html",data)
        else:
            m.send_email(email,"Registration with POUNDPAIN TECH","templates/mail/registration-verification.html",data)
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
                p.description,p.toshow,p.plan_summary,
                p.office_type_id as office_type,
                p.start_date,p.end_date,p.active,p.slot,
                p.placeholder
            from
                pricing_data p
            where 
                1 = 1 and
                toshow = 1 
            """
        p = []
        if 'type' in params and params['type'] is not None:
            q += " and office_type_id = %s " 
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
        q = """
            select 
                p.id, p.trial, p.price,
                p.office_type_id as office_type,
                p.locations, p.duration,p.upfront_cost,
                p.description,p.toshow,p.plan_summary,
                p.start_date,p.end_date,p.active,p.slot,
                p.placeholder
            from
                pricing_data p
            where 
                1 = 1
            """
        p = []
        if 'type' in params and params['type'] is not None:
            q += " and office_type_id = %s " 
            p = [params['type']]
        ret['all_plans'] = db.query(q,p)
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
        ret['do_billing_charge'] = db.query("""
            select value from system_settings where name='do_billing_charge'
            """)[0]['value']
        ret['billing_system_id'] = self.getBillingSystem()
        if "X-Forwarded-For" in request.headers:
            try:
                j = {}
                ip = request.headers['X-Forwarded-For']
                j['ip'] = ip
                g = int(ipaddress.ip_address(ip))
                j['ip_int'] = g
                q = """select 
                        latitude, longitude, continent, 
                        country, stateprov, city 
                       from ip_lookup where %s between ip_st_int and ip_en_int
                        limit 1
                    """
                o = db.query(q,(g,))
                for n in o:
                    j['lat'] = n['latitude']
                    j['lon'] = n['longitude']
                    j['continent'] = n['continent']
                    j['country'] = n['country']
                    j['stateprov'] = n['stateprov']
                    j['city'] = n['city']
                    break
                db.update(""" insert into visits (lat,lng,continent,country,state,city,ip,ip_int,url)
                    values (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,(
                        j['lat'],j['lon'],j['continent'],j['country'],j['stateprov'],j['city'],
                        j['ip'],j['ip_int'],request.path
                    )
                )
            except Exception as e:
                print("LANDING_ERROR: %s" % str(e))
        return ret

class RegisterProvider(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def createCustomer(self,name,email,off_id,db):
        if config.getKey('email_to_override') is not None:
            email = config.getKey('email_to_override')
        r = client.customers.create_customer({
            'given_name': name,
            'email_address':email,
            'idempotency_key': str(uuid.uuid4())            
        })
        if r.is_error():
            print(r.errors)
            raise Exception("ERROR retrieving cards")
        r = r.body
        db.update("update office set stripe_cust_id=%s where id=%s",
            (r['customer']['id'],off_id)
        )
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,1,'Added to Square as customer'
            )
        """,(off_id,))
        return r['customer']['id']

    def customerCard(self,cust_id,token,card,pcard_id,off_id,db):
        r = client.cards.create_card(body = {
                'source_id':token,
                'idempotency_key': encryption.getSHA256()[:45],
                'card': { 
                    'customer_id': cust_id,
                    'card_brand': card['brand'],
                    'last_4':card['last4'],
                    'exp_month':card['expMonth'],
                    'exp_year':card['expYear']
                } 
            }
        )
        if r.is_error():
            print(r.errors)
            raise Exception("ERROR retrieving cards")
        r = r.body
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,1,'Added card to Square'
            )
        """,(off_id,))
        db.update("""
            update office_cards set sync_provider=1 where id=%s
            """,(pcard_id,)
        )
        return r['card']['id']

    def execute(self, *args, **kwargs):
        ret = {}
        ret['success'] = True
        params = args[1][0]
        db = Query()
        RT = self.getRegistrationTypes()
        OT = self.getOfficeTypes()
        INV = self.getInvoiceIDs()
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
        if 'billing_system_id' in params:
            BS = params['billing_system_id']
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
            select id as a from users where lower(email)=lower(%s)
            UNION ALL
            select ou.user_id as a from 
                office o,office_addresses oa,office_user ou
             where 
                o.id=oa.office_id and o.id = ou.office_id
                and lower(o.email)=lower(%s)
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
            db.update("insert into office (name,office_type_id,email,cust_id,active,billing_system_id) values (%s,%s,%s,%s,1,%s)",
                (params['name'],provtype,params['email'].lower(),params['cust_id'],BS)
            )
            off_id = db.query("select LAST_INSERT_ID()");
            off_id = off_id[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_languages (office_id,languages_id) values (%s,1)
                """,(off_id,)
            )
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,1,'Created (Registration)'
                )
            """,(off_id,))
    
        for x in params['addresses']:
            if x['addr1'] is None:
                continue
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
                insert into office_history(office_id,user_id,text) values (
                    %s,1,'Created (Registration)'
                )
            """,(off_id,))
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
                    insert into users (first_name,last_name,email,phone,active) values (%s,%s,%s,%s,1)
                    """,(params['first'],params['last'],params['email'].lower(),params['phone'])
                )
                uid = db.query("select LAST_INSERT_ID()");
                userid = uid = uid[0]['LAST_INSERT_ID()']
            db.update("""
                update office set user_id=%s,commission_user_id=1 where id=%s
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
        else:
            l = db.query("""
                select id from provider_queue where office_id=%s
                """,(off_id,)
            )
            if len(l) > 0:
                pq_id = l[0]['id']
        db.update("""
            update provider_queue set updated=now() where office_id=%s
            """,(off_id,)
        )
        db.update("""
            update users set active=1 where id=%s
            """,(userid,)
        )
        planid = 0
        invid = 0
        coup = {}
        selplan = 0
        discount = 0
        plan_total = 0
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
                plan_total = PL[selplan]['upfront_cost']*PL[selplan]['duration']
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
                    ocoup = db.query("""
                        select total,perc,reduction,name from coupons where id = %s
                        """,(params['coupon_id'],)
                    )
                    if len(ocoup) > 0:
                        coup = ocoup[0]
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
                        discount = -val
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
        cust_id = ''
        card_id = ''
        stripe_id = ''
        mode = "charge_automatically"
        s_invoice_id = ''
        if 'card' in params and params['card'] is not None:
            stripe_id = None
            card_id = 0
            if BS == 1:
                cust_id = params['cust_id']
                card = params['card']['token']
                tok = card['id']
                l = db.query("""
                    select stripe_key from setupIntents where uuid=%s
                """,(cust_id,))
                stripe_id = l[0]['stripe_key']
                st = Stripe.Stripe()
                email = params['email']
                if config.getKey("email_to_override") is not None:
                    email = config.getKey("email_to_override")
                (pid,src) = st.confirmCard(params['intent_id'],cust_id,stripe_id,tok)
                stripe.Customer.modify(
                    stripe_id,
                    name=params['name'],
                    email=email,
                    phone=params['phone']
                )
                card_id = src['id']
                db.update("""
                    update office set stripe_cust_id=%s where id=%s
                    """,(stripe_id,off_id)
                )
                db.update("""
                    insert into office_cards(
                        office_id,card_id,last4,exp_month,
                        exp_year,client_ip,
                        address1,address2,state,city,zip,name,
                        is_default
                    ) values (
                        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1
                    )
                    """,(off_id,src['id'],card['card']['last4'],
                         card['card']['exp_month'],card['card']['exp_year'],
                         card['client_ip'],card['card']['address_line1'],
                         card['card']['address_line2'],card['card']['address_state'],card['card']['address_city'],
                         card['card']['address_zip'],card['card']['name']
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
                        card['token'],
                        card['token'],
                        card['last4'],
                        card['token']['details']['card']['expMonth'],
                        card['token']['details']['card']['expYear'],
                        card['token']['details']['card']['brand']
                        )
                )
                card_id = db.query("select LAST_INSERT_ID()");
                card_id = card_id[0]['LAST_INSERT_ID()']
            elif BS == 3:
                card = params['card']
                db.update("""
                    insert into office_cards(
                        office_id,card_id,payment_id,last4,
                        exp_month,exp_year,is_default,brand
                    ) values (%s,%s,%s,%s,%s,%s,1,%s)
                    """,(
                        off_id,
                        card['id'],
                        card['id'],
                        card['card_last_four'],
                        card['card_exp'][:2],
                        card['card_exp'][2:],
                        card['method']
                        )
                )
                card_id = db.query("select LAST_INSERT_ID()");
                card_id = card_id[0]['LAST_INSERT_ID()']
            try: 
                do_billing = False
                check = db.query("""
                    select value from system_settings where name=%s
                    """,('do_billing_charge',)
                )
                if len(check) > 0:
                    do_billing = check[0]['value']
                if do_billing and BS==3: # staxx
                    card_id = card['id']
                    cust_id = card['customer']['id']
                    db.update(""" 
                        update office set stripe_cust_id = %s where id=%s
                        """,(card['customer']['id'],off_id)
                    )
                    lines = []
                    lines.append({
                        'item': PL[selplan]['description'],
                        'details': PL[selplan]['description'],
                        'quantity': 1,
                        'price':PL[selplan]['upfront_cost']*PL[selplan]['duration']
                    })
                    if len(coup) > 0:
                        lines.append({
                            'item': coup['name'],
                            'details': coup['name'],
                            'quantity': 1,
                            'price':discount
                        })
                    body = { 
                        'customer_id':card['customer']['id'],
                        'send_now': False,
                        'url': 'https://app.staxpayments.com/#/bill/',
                        'total': str(plan_total + discount),
                        'meta': { 
                            'lineItems':lines,
                            'isCCPaymentEnabled': True,
                            'isACHPaymentEnabled': True,
                            'isTipEnabled': False,
                        } 
                    } 
                    sp = StaxxPayments()
                    s = sp.createInvoice(body)
                    s_invoice_id = s['id']
                    body = { 
                        'payment_method_id':card_id,
                        'email_receipt':True,
                        'apply_balance': plan_total + discount
                    } 
                    s = sp.payInvoice(s_invoice_id,body)
                    db.update("""
                        insert into invoices (office_id,invoice_status_id,
                            office_plans_id,billing_period,total,billing_system_id) 
                            values (%s,%s,%s,date(now()),%s,%s)
                        """,(off_id,INV['PAID'],planid,plan_total,BS)
                    )
                    invid = db.query("select LAST_INSERT_ID()")
                    invid = invid[0]['LAST_INSERT_ID()']
                    db.update("""
                        insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
                        """,(off_id,invid,'draft')
                    )
                    db.update("""
                        insert into invoice_history (invoices_id,user_id,text) values 
                            (%s,%s,%s)
                        """,(invid,1,'Submitted invoice to Staxx' )
                    )
                    db.update("""
                        insert into office_history(office_id,user_id,text) values (
                            %s,1,'Created initial invoice'
                        )
                    """,(off_id,))
                if do_billing and BS==1: # Stripe
                    items = []
                    s = stripe.Invoice.create(
                        auto_advance=True,
                        customer=stripe_id,
                        default_payment_method=card_id,
                        collection_method=mode
                        )
                    stripe.InvoiceItem.create(
                        customer=stripe_id,
                        description=PL[selplan]['description'],
                        amount=int(PL[selplan]['upfront_cost']*PL[selplan]['duration']*100),
                        invoice=s.id
                    )
                    s_invoice_id = s['id']
                    if len(coup) > 0:
                        stripe.InvoiceItem.create(
                            customer=stripe_id,
                            description=coup['name'],
                            amount=int(discount * 100),
                            invoice=s.id
                        )
                    db.update("""
                        insert into invoices (office_id,invoice_status_id,
                            office_plans_id,billing_period,total,billing_system_id) 
                            values (%s,%s,%s,date(now()),%s,%s)
                        """,(off_id,INV['CREATED'],planid,plan_total,BS)
                    )
                    invid = db.query("select LAST_INSERT_ID()")
                    invid = invid[0]['LAST_INSERT_ID()']
                    db.update("""
                        insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
                        """,(off_id,invid,'draft')
                    )
                    db.update("""
                        insert into invoice_history (invoices_id,user_id,text) values 
                            (%s,%s,%s)
                        """,(invid,1,'Submitted invoice to stripe' )
                    )
                    db.update("""
                        insert into office_history(office_id,user_id,text) values (
                            %s,1,'Created initial invoice'
                        )
                    """,(off_id,))
                if do_billing and BS==2: # square
                    # Create the customer
                    cust = self.createCustomer(params['name'],params['email'],off_id,db)
                    # save the card to the customer
                    card = self.customerCard(cust,card['token']['token'],card['token']['details']['card'],card_id,off_id,db)
                    # make a payment
                    loc = config.getKey("square_loc_key")
                    order = {
                        'location_id': loc,
                        'reference_id': 'order-%s-%s' % (off_id,calcdate.getYearMonthDay()),
                        'customer_id': cust,
                        'discounts': [],
                        'line_items':[]
                    }
                    order['line_items'].append({
                        'name':PL[selplan]['description'],
                        'quantity': str(1),
                        'base_price_money':{'amount':plan_total * 100,'currency':'USD'}
                    })
                    if len(coup) > 0:
                        order['discounts'].append({
                            'uid': coup['name'].replace("#","").replace(" ",""),
                            'name':coup['name'],
                            'scope': 'ORDER',
                            'amount_money':{'amount':-discount * 100,'currency':'USD'}
                        })
                    if plan_total > 0:
                        db.update("""
                            insert into invoices (office_id,invoice_status_id,
                                office_plans_id,billing_period,total,billing_system_id) 
                                values (%s,%s,%s,date(now()),%s,%s)
                            """,(off_id,INV['CREATED'],planid,plan_total,BS)
                        )
                        invid = db.query("select LAST_INSERT_ID()")
                        invid = invid[0]['LAST_INSERT_ID()']
                        db.update("""
                            insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
                            """,(off_id,invid,'draft')
                        )
                        r = client.orders.create_order(body={'order': order});
                        if r.is_error():
                            raise Exception(json.dumps(r.errors))
                        r = r.body
                        order_id = r['order']['id']
                        db.update("""
                            update invoices set order_id = %s where id = %s
                            """,(r['order']['id'],invid)
                        )
                        s = client.invoices.create_invoice(
                            body = {
                                'invoice': {
                                    'location_id': loc,
                                    'order_id': order_id,
                                    'primary_recipient': { 
                                        'customer_id': cust
                                    },
                                    'delivery_method':'EMAIL',
                                    'store_payment_method_enabled': True,
                                    'accepted_payment_methods': { 
                                        'card':True,
                                        'bank_account':True
                                    },
                                    'payment_requests': [{
                                        'request_type':'BALANCE',
                                        'automatic_payment_source':'CARD_ON_FILE',
                                        'card_id': card,
                                        'due_date': calcdate.getYearMonthDay(),
                                        'tipping_enabled':False,
                                    }]
                                }
                            }
                        )
                        if s.is_error():
                            raise Exception(json.dumps(s.errors))
                        s = s.body
                        s_invoice_id = s['invoice']['id'];
                        pub = client.invoices.publish_invoice(
                            invoice_id = s['invoice']['id'],
                            body = { 'version': 0}
                        )
                        if pub.is_error():
                            de = client.invoices.delete_invoice(invoice_id=s['invoice']['id'],body={'version': 1})
                            if de.is_error():
                                print(json.dumps(de.errors))
                                raise Exception(json.dumps(s.errors))
                            raise Exception(json.dumps(pub.errors))
                        db.update("""
                            insert into invoice_history (invoices_id,user_id,text) values 
                                (%s,%s,%s)
                            """,(invid,1,'Submitted invoice to Square' )
                        )
                # --- Operations on all invoices
                db.update("""
                    update invoices set stripe_invoice_id=%s,invoice_status_id=%s where id=%s
                    """,(s_invoice_id,INV['PAID'],invid)
                )
                db.update("""
                    update invoices set invoice_status_id=%s where id=%s
                    """,(INV['PAID'],invid)
                )
                db.update("""
                    insert into invoice_items 
                        (invoices_id,description,price,quantity)
                    values 
                        (%s,%s,%s,%s)
                    """,
                    (invid,PL[selplan]['description'],PL[selplan]['upfront_cost']*PL[selplan]['duration'],1)
                )
                if len(coup) > 0:
                    db.update("""
                        insert into invoice_items 
                            (invoices_id,description,price,quantity)
                        values 
                            (%s,%s,%s,%s)
                        """,
                        (invid,coup['name'],discount,1)
                    )
                comm = db.query("""
                    select id,commission from commission_structure
                        where pricing_data_id=%s
                    """,(params['plan'],)
                )
                if len(comm) > 0:
                    comm = comm[0]
                    db.update("""
                        insert into commission_users (user_id,commission_structure_id,amount,office_id,invoices_id)
                            values (%s,%s,%s,%s,%s)
                        """,(1,
                             comm['id'],
                             plan_total*comm['commission'],off_id,invid
                            )
                    )
                    db.update("""
                        insert into invoice_history (invoices_id,user_id,text) values 
                            (%s,%s,%s)
                        """,(invid,1,'Calculated commission based on plan' )
                    )
                months = 0
                months = PL[selplan]['duration']
                start_date = db.query("""
                    select
                        date_add(now(), INTERVAL %s month) as bp
                    """,(0,)
                )
                start_date = start_date[0]['bp']
                for t in range(1,months):
                    j = db.query("""
                        select
                            date_add(%s, INTERVAL %s month) as bp
                        """,(start_date,t)
                    )
                    bp = j[0]['bp']
                    o = db.update("""
                        insert into invoices (office_id,invoice_status_id,office_plans_id,billing_period,billing_system_id) 
                            values (%s,%s,%s,%s,%s)
                        """,(off_id,INV['CREATED'],planid,bp,BS)
                    )
                    newid = db.query("select LAST_INSERT_ID()")
                    newid = newid[0]['LAST_INSERT_ID()']
                    db.update("""
                        insert into invoice_items 
                            (invoices_id,description,price,quantity)
                        values 
                            (%s,%s,%s,%s)
                        """,
                        (newid,PL[selplan]['description'],0,1)
                    )
                    db.update("""
                        insert into invoice_history (invoices_id,user_id,text) values 
                            (%s,%s,%s)
                        """,(newid,1,'Generated invoice' )
                    )
                    db.update("""
                        insert into invoice_history (invoices_id,user_id,text) values 
                            (%s,%s,%s)
                        """,(newid,1,'Set invoice to $0 for plan' )
                    )
                    db.update("""
                        insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
                        """,(off_id,newid,'draft')
                    )
            except Exception as e:
                print(str(e))
                exc_type, exc_value, exc_traceback = sys.exc_info()
                traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
                return {'success': False, 'message': 'There was an error with the payment method. Please try again.'}
        db.update("""
            update provider_queue set 
            sf_lead_executed=1,closed_date=now(),
            provider_queue_status_id = %s where office_id = %s
            """,(PQ['IN_NETWORK'],off_id)
        )
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,1,'User Registered, Set to IN_NETWORK(SF Lead Registration)'
            )
        """,(off_id,))
        db.update("""
            update office set active = 1,import_sf=1 where id = %s
            """,(off_id,)
        )
        db.update("""
            update users set active = 1 where id = %s
            """,(userid,)
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
        if self.isUIV2(): 
            data['__LINK__']:"%s/verify/%s" % (url,val.decode('utf-8'))
        sysemail = config.getKey("support_email")
        m = Mail()
        data['__OFFICE_NAME__'] = params['name']
        data['__OFFICE_ID__'] = off_id
        data['__OFFICE_URL__'] = "%s/#/app/main/admin/office/%s" % (url,off_id)
        if self.isUIV2(): 
            data['__OFFICE_URL__'] = "%s/app/main/admin/office/%s" % (url,off_id)
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Registration with POUNDPAIN TECH","templates/mail/registration-verification.html",data)
            m.sendEmailQueued(sysemail,"New Customer Signed Up","templates/mail/office-signup.html",data)
        else:
            m.send_email(email,"Registration with POUNDPAIN TECH","templates/mail/registration-verification.html",data)
            m.send_email(sysemail,"New Customer Signed Up","templates/mail/office-signup.html",data)
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
        PQ = self.getProviderQueueStatus()
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
            db.update("insert into office (name,office_type_id,email,active) values (%s,%s,%s,1)",
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
                    values (%s,%s,provider_queue_status_id)
                """,(insid,ST['Preferred Provider'],PQ['IN_NETWORK'])
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
        if self.isUIV2(): 
            data['__LINK__']:"%s/verify/%s" % (url,val.decode('utf-8'))
        m = Mail()
        data['__OFFICE_NAME__'] = params['name']
        data['__OFFICE_URL__'] = "%s/#/app/main/admin/office/%s" % (url,insid)
        if self.isUIV2(): 
            data['__OFFICE_URL__'] = "%s/app/main/admin/office/%s" % (url,insid)
        sysemail = config.getKey("support_email")
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Registration with POUNDPAIN TECH","templates/mail/registration-verification.html",data)
            m.sendEmailQueued(sysemail,"New Referrer Signed Up","templates/mail/office-signup.html",data)
        else:
            m.send_email(email,"Registration with POUNDPAIN TECH","templates/mail/registration-verification.html",data)
            m.send_email(sysemail,"New Referrer Signed Up","templates/mail/office-signup.html",data)
        db.commit()
        return ret

class ContactUs(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        ret['success'] = True
        params = args[1][0]
        db = Query()
        o = db.query("""
            select id from contactus_emails 
            where lower(email)=lower(%s)
            """,(params['email'],)
        )
        if len(o) > 0:
            return {'success':True}
        db.update("""
            insert into contactus_emails (name,email,message) 
                values (%s,lower(%s),%s)
            """,(params['name'],params['email'],params['message'])
        )
        sysemail = config.getKey("contact_us_email")
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/login" % (url,),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % (url,)
        m = Mail()
        data['__NAME__'] = params['name']
        data['__EMAIL__'] = params['email']
        data['__MESSAGE__'] = params['message']
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(sysemail,"Provider Information Inquiry - %s" % params['email'],"templates/mail/information-inquiry.html",data)
        else:
            m.send_email(sysemail,"Provider Information Inquiry - %s" % params['email'],"templates/mail/information-inquiry.html",data)
        db.commit()
        return {'success':True}

class Subscribe(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        ret['success'] = True
        params = args[1][0]
        db = Query()
        sysemail = config.getKey("contact_us_email")
        url = config.getKey("host_url")
        o = db.query("""
            select id from subscribe_emails 
            where lower(email)=lower(%s)
            """,(params['email'],)
        )
        if len(o) > 0:
            return {'success':True}
        db.update("""
            insert into subscribe_emails (email) 
                values (lower(%s))
            """,(params['email'],)
        )
        data = { 
            '__LINK__':"%s/#/login" % (url,),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % (url,)
        m = Mail()
        data['__EMAIL__'] = params['email']
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(sysemail,"Subscribe to mail list","templates/mail/subscribe.html",data)
        else:
            m.send_email(sysemail,"Subscribe to mail list","templates/mail/subscribe.html",data)
        db.commit()
        return {'success':True}

class Location(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def doJenkins(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        ret['success'] = True
        params = args[1][0]
        token = None
        uid = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if 'authorization' in request.headers:
            token = request.headers['authorization']
        db = Query()

        if token is not None:
            token = token.replace("Bearer ","")
            data = jwt.decode(token, config.getKey("encryption_key"), algorithms=['HS256'])
            if 'user_id' in data:
                uid = data['user_id']

        if not uid:
            return {'success':True}

        db.update("""
            insert into user_location (user_id,lat,lon) values (%s,%s,%s)
            """,(uid,params['lat'],params['lon'])
        )
        db.commit()
        return {'success':True}

class OnlineDemoJoin(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        params = args[1][0]
        if 'token' not in params:
            return {'success': False, 'message':'NO_UUID_SPECIFIED'}
        db = Query()
        # Get the time in EDT
        o = db.query("""
            select 
                start_date,end_date,now(),timestampdiff(SECOND,start_date,now()) as t1
            from 
                online_demo_meetings odm
            where 
                meeting_id=%s and
                date_add(end_date,INTERVAL -4 HOUR) > date_add(now(),INTERVAL -4 HOUR)
            """,(params['token'],)
        )
        if len(o) < 1:
            return {'success':False,'message':'MEETING_EXPIRED'}
        sd = o[0]['t1']
        if sd < 1:
            return {'success':False,'message':'MEETING_WAIT_START'}
        return {'success':True}

class OnlineDemoTraffic(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        params = args[1][0]
        t = AdminTraffic.TrafficGet()
        ret = t.getTrafficData(params)
        return ret

class CalendarBooking(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        params = args[1][0]
        print("params",params)
        db = Query()
        db.update("""
            insert into calendar_bookings 
                (
                    email,phone,description,
                    day, time, timezone, offset
                ) values (
                    %s,%s,%s,%s,%s,%s,%s
                )
            """,(params['email'],params['phone'],params['description'],
                 params['date'],params['time'],
                 params['timezone'],params['tz_offset']
                )
        )
        db.commit()
        return ret

class RegisterPatient(RegistrationsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        ret['success'] = True
        params = args[1][0]
        params['name'] = "%s %s" % (params['first_name'],params['last_name'])
        sysemail = config.getKey("contact_us_email")
        url = config.getKey("host_url")
        db = Query()
        print(params)
        ru = OfficeReferrals.ReferrerUpdate()
        ru.processRow(
            1,params,None,encryption.getSHA256(json.dumps(params,sort_keys=True)),
            db)
        data = { 
            '__LINK__':"%s/#/login" % (url,),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % (url,)
        m = Mail()
        data['__NAME__'] = "%s %s" % (params['first_name'],params['last_name'])
        data['__EMAIL__'] = params['email']
        data['__MESSAGE__'] = params['description']
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(sysemail,"Patient Information Inquiry - %s" % params['email'],"templates/mail/patient-inquiry.html",data)
        else:
            m.send_email(sysemail,"Patient Information Inquiry - %s" % params['email'],"templates/mail/patient-inquiry.html",data)
        db.commit()
        return {'success':True}
