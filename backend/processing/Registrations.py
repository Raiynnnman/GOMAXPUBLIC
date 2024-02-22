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
        if 'type' not in params:
            return {'success': True}
        if 'last_name' not in params:
            params['last_name'] = ''
        if 'first_name' not in params:
            params['first_name'] = ''
        if 'email' not in params:
            return {'success': True}
        if 'phone' not in params:
            params['phone'] = ''
        email = params['email']
        g = params['type']
        if g not in RT:
            return {'success': True}
        t = RT[g]
        db = Query()
        db.update("""
            insert into registrations (
                email,first_name,last_name,phone,registration_types_id,age,
                addr1,city,state,zipcode,message,procs,registrations_timeframe_id,
                genders_id
            ) values
                (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
            )
            """,(
                params['email'],params['first_name'],params['last_name'],params['phone'],t,
                params['age'],params['addr1'],params['city'],params['state'],params['zipcode'],
                params['comments'],params['procs'],params['timeframe'],params['gender']
            )
        )
        db.commit()
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
            '__LINK__':"%s/#/register/%s" % (url,val.decode('utf-8')),
            '__BASE__':url
        } 
        m = Mail()
        m.defer(email,"Registration with Direct Health Delivery","templates/mail/registration-verification.html",data)
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
        except:
            log.info("TOKEN_INVALID")
            return {'success':False,'message':'INVALID_TOKEN'}
        db.update("""
            update registrations set verified = 1 where id=%s
            """,(myid,)
        )
        db.commit()
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
            select price,locations,duration,start_date,end_date,active,slot
            from
                pricing_data p
            where 
                end_date > now()
            order by 
                slot asc,
                start_date desc
            
        """)
        ret['pricing'] = o
        return ret

class RegistrationList(RegistrationsBase):

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
        db = Query()
        o = db.query("""
            select 
                r.id,r.email,
                r.first_name,r.last_name,
                r.phone,r.created,r.verified,rt.name as reg_type,
                r.addr1,r.state,r.zipcode, r.message,created
            from 
                registrations r,
                registration_types rt
            where 
                r.registration_types_id = rt.id 
            order by created desc
        """
        )
        ret['registrations'] = o
        return ret
