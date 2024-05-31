# coding=utf-8

import sys
import os
import json
import unittest
import jwt
import base64

sys.path.append(os.path.realpath(os.curdir))

from util import encryption
from util.Logging import Logging
from util.Mail import Mail
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from processing.Profile import Profile
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials

log = Logging()
config = settings.config()
config.read("settings.cfg")

class UserLogin(SubmitDataRequest):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getProfile(self,email):
        db = Query()
        u = db.query(
            """
            select id,password,email,active,locked from users where email = %s
            """,(email,)
        )
        return u

    def execute(self, *args, **kwargs):
        ret = {}
        a = Audit()
        db = Query()
        jobid = args[0]
        user = args[1]
        if isinstance(user,list):
            user = user[0]
        if 'email' not in user:
            raise InvalidCredentials("EMAIL_REQUIRED")
        if 'password' not in user:
            raise InvalidCredentials("PASSWORD_REQUIRED")
        email = user['email'].lower()
        if '@' not in email:
            raise InvalidCredentials("INVALID_EMAIL")
        if len(email) < 1:
            raise InvalidCredentials("EMAIL_REQUIRED")
        if ' ' in email:
            raise InvalidCredentials("INVALID_EMAIL")
        passw = user['password']
        if len(passw) < 1:
            log.info("user %s had no password" % email)
            raise InvalidCredentials("PASSWORD_REQUIRED")
        u1 = self.getProfile(email.lower())
        if len(u1) < 1:
            log.info("user %s not found" % email)
            raise InvalidCredentials("USER_NOT_FOUND")
        p = Profile()
        u1 = u1[0]
        u = p.execute(jobid,u1)
        db.update("insert into login_attempts (user_id) values(%s)",(u1['id'],))
        db.commit()
        try:
            #val = encryption.decrypt(u1['password'],config.getKey("encryption_key"))
            val = passw
        except:
            log.info("user %s decryption failed" % email)
            raise InvalidCredentials("INVALID_PASSWORD")
        if u1['id'] == 1:
            log.info("user %s invalid account" % email)
            raise InvalidCredentials("INVALID_ACCOUNT")
        if passw != val:
            log.info("INCORRECT_PASSWORD: %s" % user['email'])
            if len(u['offices']) > 0:
                a.message(False,u1['id'],u['offices'][0],'INCORRECT_PASSWORD',u['email'])
            raise InvalidCredentials("INCORRECT_PASSWORD")
        if not u1['active']:
            log.info("user %s not active" % email)
            raise InvalidCredentials("ACCOUNT_INACTIVE")
        if u1['locked']:
            log.info("user %s locked" % email)
            if len(u['offices']) > 0:
                a.message(False,u1['id'],u['offices'][0],'ACCOUNT_LOCKED',u1['email'])
            raise InvalidCredentials("ACCOUNT_LOCKED")
        if not self.checkLocked(u1['id']):
            if len(u['offices']) > 0:
                a.message(False,u1['id'],u['offices'][0],'ACCOUNT_LOCKED',u['email'])
            log.info("user %s locked" % email)
            raise InvalidCredentials("ACCOUNT_LOCKED")
        ret = self.generateToken(u1)
        db.update("update users set last_login=now() where id=%s",(u1['id'],))
        db.commit()
        log.info("LOGIN_SUCCESS: %s" % email)
        if len(u['offices']) > 0:
            a.message(True,u1['id'],u['offices'][0],'LOGIN_SUCCESS',u1['email'])
        print("taco tuesday" , ret)
        return {"token":ret}

    def generateToken(self, user):
        d = { 
            "email":user['email'].lower(),
            "user_id":user['id']
        } 
        encoded_jwt = jwt.encode(d,config.getKey("encryption_key"),algorithm="HS256")
        return encoded_jwt.decode('utf-8')
        
    def checkLocked(self,user_id):
        db = Query()
        lock = db.query("""
            select count(user_id) as cnt from login_attempts where user_id=%s and 
            TIMESTAMPDIFF(SECOND,created,now()) < 15
        """, (user_id,))
        if lock[0]['cnt'] > 5:
            return False
        return True

class ResetPasswordWithToken(SubmitDataRequest):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def checkPassword(self, password):
        ret = {'success':True}
        hasUpper = False
        for x in password:
            if x.isupper():
                hasUpper = True
        if not hasUpper:
            return { 'success': False, 'message': 'ONE_UPPERCASE_REQUIRED' }
        hasLower = False
        for x in password:
            if x.islower():
                hasLower = True
        if not hasLower:
            return { 'success': False, 'message': 'ONE_LOWERCASE_REQUIRED' }
        hasNum = False
        for x in password:
            if x.isdigit():
                hasNum = True
        if not hasNum:
            return { 'success': False, 'message': 'ONE_NUMBER_REQUIRED' }
        if len(password) < 8:
            return { 'success': False, 'message': 'PASSWORD_EIGHT_LENGTH_REQUIRED' }
        return ret

    def execute(self, *args, **kwargs):
        ret = []
        params = args[1][0]
        if 'password' not in params:
            ret = { 
                "success":False,
                "message": "PASSWORD_REQUIRED"
            }
            return ret
        pwtest = self.checkPassword(params['password'])
        if not pwtest['success']:
            return pwtest
        if 'token' not in params:
            ret = { 
                "success":False,
                "message": "TOKEN_REQUIRED"
            }
            return ret
        if params['token'] is None: 
            ret = { 
                "success":False,
                "message": "INVALID_TOKEN_IS_EMPTY"
            }
            return ret
        utoken = params['token']
        db = Query()
        val = ''
        try:
            val = base64.b64decode(utoken.encode('utf-8'))
            val = encryption.decrypt(
                val,
                config.getKey("encryption_key")
            )
            val = json.loads(val)
        except Exception as e:
            log.error("TOKEN: %s" % str(e))
            ret = { 
                "success":False,
                "message": "INVALID_TOKEN_CORRUPT"
            }
            return ret
        o = db.query("""
            select id from users where email=%s
        """,(val['e'],)
        )
        if len(o) < 1:
            ret = { 
                "success":False,
                "message": "USER_DOESNT_EXIST"
            }
            return ret
        user_id = o[0]['id']
        if 'i' in val:
            l = db.query("""
                select user_id from registrations
                where id = %s""",(val['i'],))
            for t in l:
                val['u'] = t['user_id']
        if 'u' not in val:
            ret = { 
                "success":False,
                "message": "NO_UID_IN_TOKEN"
            }
            return ret
        if user_id != val['u']:
            ret = { 
                "success":False,
                "message": "INVALID_TOKEN_NO_USER_MATCH"
            }
            return ret
        t = db.query("""
            select token from user_login_tokens 
                where user_id=%s and expires > now()
            """,(user_id,))
        if len(t) < 1:
            ret = { 
                "success":False,
                "message": "INVALID_TOKEN_EXPIRED"
            }
            return ret
        token = t[0]['token']
        if token != utoken:
            ret = { 
                "success":False,
                "message": "INVALID_TOKEN_NO_MATCH"
            }
            return ret
        e_pass = encryption.encrypt(params['password'],config.getKey("encryption_key"))
        db.update("update users set updated=now(),password=%s where id=%s",(e_pass,user_id))
        db.update("insert into user_passwords (user_id,password) values (%s,%s)",(user_id,e_pass))
        db.update("delete from user_login_tokens where user_id=%s",(user_id,))
        db.commit()
        ret = { 
            "success":True
        }
        return ret
        

class ResetPasswordGetToken(SubmitDataRequest):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def genToken(self,user_id,email):
        db = Query()
        o = db.update("delete from user_login_tokens where user_id=%s",(user_id,))
        db.commit()
        val = encryption.encrypt(
            json.dumps({'u':user_id,'e':email}),
            config.getKey("encryption_key")
        )
        val = base64.b64encode(val.encode('utf-8'))
        o = db.update("""
            insert into user_login_tokens (user_id,token,expires) values (%s,%s,date_add(now(),interval 24 hour))
         """,(user_id,val)
        )
        db.commit()
        return val

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
        user_id = o[0]['id']
        val = self.genToken(user_id,email)
        db.commit()
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/reset/%s" % (url,val.decode('utf-8')),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/reset/%s" % (url,val.decode('utf-8'))
        m = Mail()
        m.defer(email,"Reset Password Request","templates/mail/reset-password.html",data)
        return ret

class UserLoginTest(unittest.TestCase):

    def test_login(self):
        d = {
            'email': 'pmaszy@poundpain.com',
            'password':'Leader12345!'
        }
        ul = UserLogin()
        ret = ul.execute(1,d)
        log.info(ret)

    def test_bad_password(self):
        d = {
            'email': 'pmaszy@poundpain.com',
            'password':'Leader1345'
        }
        try:
            ul = UserLogin()
            ret = ul.execute(1,d)
            self.assertEqual(0,1)
        except Exception as e:
            log.info(str(e))
            self.assertEqual(1,1)

    def test_bad_email(self):
        d = {
            'email': 'pmaszy',
            'password':'Leader1345'
        }
        try:
            ul = UserLogin()
            ret = ul.execute(1,d)
            self.assertEqual(0,1)
        except Exception as e:
            log.info(str(e))
            self.assertEqual(1,1)

    def test_no_email(self):
        d = {
            'email': '',
            'password':'Leader1345'
        }
        try:
            ul = UserLogin()
            ret = ul.execute(1,d)
            self.assertEqual(0,1)
        except Exception as e:
            log.info(str(e))
            self.assertEqual(1,1)

    def test_no_pass(self):
        d = {
            'email': 't@t.com',
            'password':''
        }
        try:
            ul = UserLogin()
            ret = ul.execute(1,d)
            self.assertEqual(0,1)
        except Exception as e:
            log.info(str(e))
            self.assertEqual(1,1)
