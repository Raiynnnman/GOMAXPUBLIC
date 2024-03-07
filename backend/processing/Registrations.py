# coding=utf-8

import sys
import os
import random
import json
import unittest
import jwt
import base64

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
            inem = myjson['e']
            HAVE = False
            l = db.query("""
                select id from users where email = %s
                """,(inem,)
            )
            for t in l:
                HAVE=True
            if HAVE:
                return {'success':False,'message':'USER_ALREADY_REGISTERED'}
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
            db.update("""
                update registrations set user_id = %s where id = %s
                """,(insid,inis)
            )
            db.update("""
                insert into user_login_tokens (user_id,token,expires) values
                    (%s,%s,date_add(now(),INTERVAL 24 HOUR))
                """,(insid,params['token'])
            )
            offname = "user-%s" % encryption.getSHA256(u['email'])
            db.update("insert into office (name,office_type_id) values (%s,%s)",
                (
                    offname[:10],
                    OT['Customer']
                )
            )
            offid = db.query("select LAST_INSERT_ID()");
            offid = offid[0]['LAST_INSERT_ID()']
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

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {'pricing':[]}
        db = Query()
        o = db.query("""
            select id,price,locations,duration,start_date,end_date,active,slot
            from
                pricing_data p
            where 
                end_date > now()
            order by 
                slot asc,
                start_date desc
            
        """)
        # Taken out for now!
        # ret['pricing'] = o
        l = db.query("""
            select ot.id,otd.name,otd.description,otd.signup_description
            from 
                office_type ot, office_type_descriptions otd
            where 
                otd.office_type_id = ot.id
            """)
        ret['roles'] = l
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
        insid = 0
        OT = self.getOfficeTypes()
        ENT = self.getEntitlementIDs()
        PERM = self.getPermissionIDs()
        PL = self.getPlans()
        HAVE = False
        l = db.query("""
            select id from office where cust_id=%s
            """,(params['cust_id'],)
        )
        for t in l:
            HAVE = True
        if HAVE:
            return ret
        db.update("insert into office (name,office_type_id,email,cust_id,active) values (%s,%s,%s,%s,0)",
            (params['name'],OT['Chiropractor'],params['email'],params['cust_id'])
        )
        insid = db.query("select LAST_INSERT_ID()");
        insid = insid[0]['LAST_INSERT_ID()']
        for x in params['addresses']:
            db.update(
                """
                    insert into office_addresses (
                        office_id,name,addr1,phone,city,state,zipcode
                    ) values (%s,%s,%s,%s,%s,%s,%s)
                """,(insid,x['name'],x['addr1'],x['phone'],x['city'],x['state'],x['zipcode'])
            )
        db.update(
            """
            insert into provider_queue (office_id) values (%s)
            """,(insid,)
        )
        l = db.query("""
            select id from users where email = %s
            """,(params['email'],)
        )
        uid = 0
        for o in l:
            uid = o['id']
        if uid == 0:
            db.update(
                """
                insert into users (first_name,last_name,email,phone) values (%s,%s,%s,%s)
                """,(params['first'],params['last'],params['email'],params['phone'])
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
            """,(uid,ENT['Provider'])
        )
        db.update("""
            insert into user_permissions (user_id,permissions_id) values (%s,%s)
            """,(uid,PERM['Admin'])
        )
        selplan = int(params['plan'])
        db.update("""
            insert into office_plans (office_id,start_date,end_date,pricing_data_id) 
                values (%s,now(),date_add(now(),INTERVAL %s MONTH),%s)
            """,(insid,PL[selplan]['duration'],selplan)
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
        if 'card' in params:
            cust_id = params['cust_id']
            card = params['card']['card']
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
                """,(insid,card['id'],card['last4'],
                     card['exp_month'],card['exp_year'],
                     params['card']['client_ip'],pid['payment_method'],card['address_line1'],
                     card['address_line2'],card['address_state'],card['address_city'],
                     card['address_zip'],card['name']
                )
            )
        ### TODO: Send invite link
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


