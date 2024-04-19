# coding=utf-8

import sys
import os
import json
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))

from util import encryption
from util.Logging import Logging
from common import settings
from common.InvalidCredentials import InvalidCredentials
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest

log = Logging()
config = settings.config()
config.read("settings.cfg")

class Profile(SubmitDataRequest):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        jobid = args[0]
        user = args[1]
        user_id = 0
        if 'user_id' not in user and 'id' not in user:
            raise InvalidCredentials("INVALID_CERT")
        if 'user_id' in user:
            user_id = user['user_id']
        else:
            user_id = user['id']
        db = Query()
        u = db.query(
            """
            select 
                u.id,first_name,last_name,email,
                locked,active,last_login,tt.offset
            from users u
                left outer join timezones tt on tt.id = u.timezone_id
                where u.id=%s
            """,(user_id,)
        )
        if len(u) < 1:
            raise InvalidCredentials("USER_DOESNT_EXIST")
        e = db.query(
            """ select 
                   name 
                from 
                    entitlements e,user_entitlements ue
                where 
                    e.id  = ue.entitlements_id and
                    user_id=%s
            """,(user_id,)
        ) 
        A = []
        B = []
        C = []
        for x in e:
            A.append(x['name'])
        p = db.query(
            """ select 
                   name 
                from 
                    permissions e,user_permissions ue
                where 
                    e.id  = ue.permissions_id and
                    user_id=%s
            """,(user_id,)
        ) 
        OT = self.getOfficeTypes()
        for x in p:
            B.append(x['name'])
        o = db.query(
            """ select 
                   ou.office_id,o.active
                from 
                   office_user ou,
                   office o
                where 
                    ou.user_id=%s and
                    o.id = ou.office_id
                    
            """,(user_id,)
        ) 
        if isinstance(u,list):
            u = u[0]
        for x in o:
            C.append(x['office_id'])
            if x['active'] == 0:
                u['active'] == 0
        context = False
        contextValue = {}
        D = []
        if 'Admin' in A:
            c = db.query("""
                select o.id,o.name,ot.name as type from context c,office o,office_type ot
                where ot.id=o.office_type_id and c.user_id=%s and c.office_id=o.id 
                /* and timestampdiff(second,c.created,now()) < 3600 */
            """,(user_id,))
            if len(c) > 0:
                A.append(c[0]['type'])
                context = True
                contextValue = c[0]
            if 'Referrer' in A:
                A.append('OfficeAdmin')
                A.append('Referrer')
            if 'Chiropractor' in A:
                A.append('OfficeAdmin')
                A.append('Provider')
            if 'Corporation' in A:
                A.append('CorporateAdmin')
        tz = u['offset']
        if tz is None:
            tz = "0"
        if '/' in tz:
            tz = tz.split('/')[0]
        tz = tz.replace(" ","")
        if ':' not in tz:
            tz = "%s:00" % tz
        profile = {
            "id":u['id'],
            "active":u['active'],
            "first_name":u["first_name"],
            "last_name":u["last_name"],
            "email":u["email"],
            "timezone": tz,
            "offices": C,
            "entitlements": A,
            "permissions": B,
            "last_login": u["last_login"]
        }
        if context:
            profile['context'] = context
            profile['offices'] = [contextValue["id"]]
            profile['contextValue'] = contextValue
        return profile
