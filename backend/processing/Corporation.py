# coding=utf-8

import sys
import os
import json
import base64
import traceback
import unittest
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
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_corporation

log = Logging()
config = settings.config()
config.read("settings.cfg")

class CorporationBase(SubmitDataRequest):

    def __init__(self):
        super().__init__()

class CorporationUserList(CorporationBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_corporation
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        OT = self.getOfficeTypes()
        o = db.query("""
            select
               u.id,u.first_name,u.last_name,u.phone,u.email,u.active,
               json_arrayagg(
                ue.entitlements_id
               ) as entitlements
            from
                users u
                left join office_user ou on ou.user_id=u.id
                left outer join user_entitlements ue on ue.user_id=u.id
            where
                ou.user_id=u.id
                and office_id=%s
            group by 
                u.id
            """,(off_id,))
        ret['users'] = []
        for x in o:
            if x is None:
                x['entitlements'] = []
            else:
                x['entitlements'] = json.loads(x['entitlements'])
            ret['users'].append(x)
        ent = self.getEntitlementIDs()
        ret['entitlements'] = []
        ret['entitlements'].append({'name': 'Admin', 'id':ent['OfficeAdmin']}) 
        return ret

class CorporationUserUpdate(CorporationBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def saveUser(self,db,params,row,off_id):
        ENT = self.getEntitlementIDs()
        PERM = self.getPermissionIDs()
        if 'email' not in params or params['email'] is None or len(params['email']) < 1:
            return { 'row': row, 'success': False, 'message': 'UPLOAD_EMAIL_MISSING'}
        if 'first_name' not in params or params['first_name'] is None or len(params['first_name']) < 1:
            return { 'row': row, 'success': False, 'message': 'UPLOAD_FIRST_MISSING'}
        if 'last_name' not in params or params['last_name'] is None or len(params['last_name']) < 1:
            return { 'row': row, 'success': False, 'message': 'UPLOAD_LAST_MISSING'}
        o = db.query("""
            select id from users where email=%s    
            """,(params['email'].lower(),)
        )
        useExists = False
        if len(o) > 0:
            params['id'] = o[0]['id']
            userExists = True
        if 'id' in params:
            db.update("""
                update users set updated=now(),first_name=%s,last_name=%s where id=%s
                """,(params['first_name'],params['last_name'],params['id'])
            )
            insid = params['id']
            db.update("delete from office_user where user_id=%s",(insid,))
            db.update("""
                insert into office_user (office_id,user_id) values (%s,%s)
                """,(off_id,insid)
            )
        else:
            db.update("""
                insert into users (email,first_name,last_name) values 
                    (%s,%s,%s)
                """,(params['email'].lower(),params['first_name'],params['last_name'])
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            db.commit()
            db.update("""
                insert into office_user (office_id,user_id) values (%s,%s)
                """,(off_id,insid)
            )
        if 'entitlements' in params:    
            db.update("delete from user_entitlements where user_id=%s",(insid,))
            db.update("delete from user_permissions where user_id=%s",(insid,))
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values
                (%s,%s)
            """,(insid,ENT['Corporate'])
            )
            db.update("""
                insert into user_permissions (user_id,permissions_id) values
                (%s,%s)
            """,(insid,PERM['Write'])
            )
            for x in params['entitlements']:
                db.update("""
                    insert into user_entitlements (user_id,entitlements_id) values
                    (%s,%s)
                    """,(insid,x)
                )
        else:
            # if they already exist dont wipe em
            if not userExists:
                db.update("delete from user_entitlements where user_id=%s",(insid,))
                db.update("delete from user_permissions where user_id=%s",(insid,))
                db.update("""
                    insert into user_entitlements (user_id,entitlements_id) values
                    (%s,%s)
                """,(insid,ENT['Corporate'])
                )
                db.update("""
                    insert into user_permissions (user_id,permissions_id) values
                    (%s,%s)
                """,(insid,PERM['Read'])
                )
        db.commit()
        ret = {'row': row, 'success': True, 'message':'SUCCESSFULLY_IMPORTED','data': params['email']}
        if userExists:
            ret = {'row': row, 'success': False, 'message':'USER_ALREADY_EXISTED','data':params['email']}
        return ret

    @check_corporation
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        success = True
        rowId = 0
        if 'upload' not in params:
            self.saveUser(db,params,0,off_id)
        else:
            cont = params['upload']
            if 'mime' not in cont:
                return { 'success': False, 'message': 'UPLOAD_CONTENT_MISSING' }
            if cont['mime'] != 'text/csv':
                return { 'success': False, 'message': 'UPLOAD_MUST_BE_IN_CSV' }
            if 'content' not in cont or cont['content'] is None or len(cont['content']) < 1:
                return { 'success': False, 'message': 'UPLOAD_CONTENT_MISSING' }
            cont = cont['content']
            if 'base64' not in cont:
                return { 'success': False, 'message': 'FORMAT_INVALID_BASE_MISSING' }
            t = cont.split(';')
            t = t[1].split(',')
            if len(t) != 2:
                return { 'success': False, 'message': 'FORMAT_INVALID_BASE_DATA' }
            t = t[1]
            try: 
                t = base64.b64decode(t)
                t = StringIO(t.decode('utf-8',errors='ignore'))
                table = pd.read_csv(t)
                df = table
                # df.to_dict(orient='records')
                messages = []
                rowId += 1
                for row in df.itertuples(index=True, name='Pandas'):
                    x = { 'email': row[1], 'first_name': row[2], 'last_name': row[3] }
                    r = self.saveUser(db,x,rowId,off_id)
                    if not r['success']:
                        success = False
                    messages.append(r)
                ret['message'] = messages
            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
                print(str(e))
                return { 'success': False, 'message': 'PARSE_FORMAT_INVALID' }
            rowId += 1
        ret['success'] = True
        return ret
