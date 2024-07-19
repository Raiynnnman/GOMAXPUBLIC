# coding=utf-8

import sys
import os
import traceback
import pyap
import base64
import json
from nameparser import HumanName
import unittest
import jwt
import pandas as pd

sys.path.append(os.path.realpath(os.curdir))

from util import encryption,S3Processing,calcdate
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_office
from util.Mail import Mail
from processing.Office import OfficeBase

log = Logging()
config = settings.config()
config.read("settings.cfg")

class ReferrerDashboard(OfficeBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getCustomers(self,off_id):
        db= Query()
        CI = self.getReferrerUserStatus()
        o = db.query("""
            select
                ifnull(t1.num1,0) as num1, /* */
                ifnull(t2.num2,0) as num2, /* */
                ifnull(t3.num3,0) as num3, /* */
                ifnull(t4.num4,0) as num4
            from
                (select count(ci.id) as num1 from 
                    referrer_users ci
                    where 
                    referrer_id = %s) as t1,
                (select count(ci.id) as num2 from 
                    referrer_users ci
                    where 
                        referrer_id = %s and month(ci.created) = month(now())
                        and year(ci.created) = year(now())) as t2,
                (select count(ci.id) as num3 from 
                    referrer_users ci
                    where 
                    referrer_id = %s and year(ci.created) = year(now())) as t3,
                (select count(ci.id) as num4 from client_intake_offices cio,
                    referrer_users ci,referrer_users_status rus
                    where 
                    referrer_id = %s and
                    ci.referrer_users_status_id = rus.id 
                    and ci.referrer_users_status_id=%s) as t4
            """,(off_id,off_id,off_id,off_id,CI['ACCEPTED']))
        return o[0]

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        ret['clients'] = self.getCustomers(off_id)
        return ret



class ReferralUpdate(OfficeBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        if len(args) < 2:
            return {'success': False, 'message': 'TOKEN_MISSING'}
        js = args[1]
        if len(js) < 1:
            return {'success': False, 'message': 'TOKEN_INVALID_FORMAT'}
        js = js[0]
        if 'token' not in js:
            return {'success': False, 'message': 'TOKEN_REQUIRED'}
        db = Query()
        token = js['token']
        REF = self.getReferrerUserStatus()
        CI = self.getClientIntake()
        lck_id = 0
        try:
            token = base64.b64decode(token.encode('utf-8'))
            myjson = encryption.decrypt(token,config.getKey("encryption_key"))
            myjson = json.loads(myjson)
            o = myjson['o']
            r = myjson['i']
            oa = myjson['oa']
            lck = db.query("""
                select id from referrer_users_lock where referrer_users_id=%s
                """,(r,)
            )
            if len(lck) > 0:
                log.info("ALREADY_ACCEPTED_BY_ANOTHER_PROVIDER (%s)" % r)
                return {'success': False, 'message': 'ALREADY_ACCEPTED_BY_ANOTHER_PROVIDER'}
            db.update("""
                insert into referrer_users_lock (referrer_users_id) values
                    (%s)
                """,(r,)
            )
            lck_id = db.query("select LAST_INSERT_ID()");
            lck_id = lck_id[0]['LAST_INSERT_ID()']
            db.commit()
            q = db.query("""
                select 
                    ru.id,ru.referrer_users_status_id,ru.email,ru.name,ru.phone,
                    zipcode,rus.name as status,ru.user_id,ru.doa,ru.office_id
                 from 
                    referrer_users ru,
                    referrer_users_status rus
                where 
                    rus.id = ru.referrer_users_status_id and
                    ru.id = %s
                """,(r,)
            )
            if len(q) < 1:
                return {'success': False, 'message': 'REFERRAL_DOESNT_EXIST'}
            q = q[0]
            if q['referrer_users_status_id'] != REF['QUEUED'] and q['office_id'] == o:
                log.info("OFFICE_ALREADY_ACCEPTED (%s)" % r)
                return {'success': False, 'message': 'OFFICE_ALREADY_ACCEPTED'}
            if q['referrer_users_status_id'] != REF['QUEUED']:
                log.info("ALREADY_ACCEPTED_BY_ANOTHER_PROVIDER (%s)" % r)
                return {'success': False, 'message': 'ALREADY_ACCEPTED_BY_ANOTHER_PROVIDER'}
            if js['accept']:
                off = db.query("""select email from office where id=%s""",(o,))
                if len(off) < 1:
                    log.error("ERROR: No office email found for %s" % o)
                    return {'success': False, 'message': 'NO_EMAIL_FOUND_FOR_PRACTICE'}
                off = off[0]
                if off['email'] is None or len(off['email']) < 1:
                    log.error("ERROR: No office email found for %s" % o)
                    return {'success': False, 'message': 'INVALID_EMAIL_FOUND_FOR_PRACTICE'}
                userid = None
                userid_q = db.query("""
                    select referral_user_id from referrer_users where id=%s
                    """,(r,)
                )
                if len(userid_q) > 0:
                    userid = userid_q[0]['referral_user_id']
                db.update("""
                    update referrer_users set 
                        referrer_users_status_id=%s,office_id=%s 
                    where
                        id = %s
                    """,(REF['ACCEPTED'],o,r)
                )
                db.update("""
                    update referrer_users_queue set 
                        response_date=now(),
                        referrer_users_status_id=%s
                    where 
                        referrer_users_id = %s and
                        office_id = %s
                """,(REF['ACCEPTED'],r,o)
                )
                doa = ''
                try:
                    doa = calcdate.parseDate(q['doa'])
                except Exception as e:
                    print(str(e))
                    print("couldnt parse date: %s" % q['doa'])
                db.update("""
                    insert into client_intake 
                        (user_id,date_of_accident) values (%s,%s)
                    """,(user,doa.strftime('%Y-%m-%d'))
                )
                clid = db.query("select LAST_INSERT_ID()");
                clid = clid[0]['LAST_INSERT_ID()']
                db.update("""
                    insert into client_intake_offices 
                        (client_intake_id,office_id,office_addresses_id,client_intake_status_id)
                        values(%s,%s,%s,%s)
                    """,(clid,o,oa,CI['ASSIGNED'])
                )
                db.update("""
                    update referrer_users set client_intake_id=%s where id = %s
                    """,(clid,r)
                )
                email = off['email']
                url = config.getKey("host_url")
                data = { 
                    '__LINK__':"%s/#/login" % (url,),
                    '__BASE__':url
                } 
                if self.isUIV2(): 
                    data['__LINK__']:"%s/login" % (url,)
                if config.getKey("appt_email_override") is not None:
                    email = config.getKey("appt_email_override")
                m = Mail()
                if config.getKey("use_defer") is not None:
                    m.sendEmailQueued(email,"Client Acquired with POUNDPAIN TECH","templates/mail/office-appointment.html",data)
                else:
                    m.defer(email,"Client Acquired with POUNDPAIN TECH","templates/mail/office-appointment.html",data)
            else:
                db.update("""
                    update referrer_users_queue set 
                        response_date=now(),
                        referrer_users_status_id=%s
                    where 
                        referrer_users_id = %s and
                        office_id = %s 
                """,(REF['REJECTED'],r,o)
                )
            db.commit()
        except Exception as e:
            print(str(e))
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
            return {'success':False,'message':str(e)}
        finally:
            db.update("""delete from referrer_users_lock where id = %s""",(lck_id,))
            db.commit()
        return {'success':False,'message':"Successfully claimed this client. Login to check status."}

class ReferrerUpdate(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def processRow(self,office_id,row,docid,sha,db,dest_office_id=None,status=None):
        REF=self.getReferrerUserStatus()
        o = db.query("""
            select id from referrer_users where
                office_id = %s and phone = %s 
                and name = %s
            """,(office_id,row['name'],row['name'])
        )
        if len(o) > 0:
            print("WARNING: Dup detected skipping")
            return
        db.update("""
            insert into referrer_users 
                (referrer_id,referrer_users_status_id,referrer_documents_id,row_meta,sha256) 
                values (%s,%s,%s,%s,%s)
            """,(office_id,REF['QUEUED'],docid,json.dumps(row),sha)
        )
        insid = db.query("select LAST_INSERT_ID()");
        insid = insid[0]['LAST_INSERT_ID()']
        if status is not None:
            db.update("""
                update referrer_users set referrer_users_status_id=%s where id=%s
                """,(status,insid)
            )
        if dest_office_id is not None:
            db.update("""
                update referrer_users set office_id=%s where id=%s
                """,(dest_office_id,insid)
            )
        if 'name' in row:
            db.update("""
                update referrer_users set name=%s where id = %s
                """,(row['name'],insid)
            )
        if 'email' in row:
            db.update("""
                update referrer_users set email=%s where id = %s
                """,(row['email'],insid)
            )
        if 'phone' in row:
            db.update("""
                update referrer_users set phone=%s where id = %s
                """,(row['phone'],insid)
            )
        if 'user_id' in row:
            db.update("""
                update referrer_users set user_id=%s where id = %s
                """,(row['user_id'],insid)
            )
        if 'zipcode' in row:
            lat = lon = 0 
            o = db.query("""
                select lat,lon from position_zip where zipcode=%s
                """,(row['zipcode'],)
            )
            if len(o) > 0:
                lat = o[0]['lat']
                lon = o[0]['lon']
            db.update("""
                update referrer_users set zipcode=%s,lat=%s,lon=%s where id = %s
                """,(row['zipcode'],lat,lon,insid)
            )
        if 'doa' in row:
            doa = ''
            try:
                doa = calcdate.sysParseDate(row['doa'])
            except Exception as e:
                print(str(e))
                print("couldnt parse date: %s" % row['doa'])
            db.update("""
                update referrer_users set doa=%s where id = %s
                """,(doa,insid)
            )
        return insid

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        s3path = 'referrer/%s/%s' % (
            off_id,
            encryption.getSHA256("%s-%s" % (off_id,calcdate.getTimestampUTC()))
        )
        ext = '.json'
        if 'content' in params:
            data = params['content'].split('base64,')
            if len(data) != 2:
                raise Exception('CONTENT_MALFORMED')
            cont = base64.b64decode(data[1])
            ext = '.xlsx'
            path = '%s%s' % (s3path,ext)
            q=db.update("""
                insert into referrer_documents (office_id,s3path) values 
                    (%s,%s)
            """,(off_id,path)
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            S3Processing.uploadS3ItemToBucket(
                config.getKey("document_bucket_access_key"),
                config.getKey("document_bucket_access_secret"),
                config.getKey("document_bucket"),
                path,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                cont
            )
            df = pd.read_excel(cont)
            df = df.fillna('')
            df.columns = [x.lower() for x in df.columns]
            df = df.to_dict(orient='index')
            for x in df:
                self.processRow(off_id,df[x],insid,sha,db)
        else:
            path = '%s%s' % (s3path,ext)
            q=db.update("""
                insert into referrer_documents (office_id,s3path) values 
                    (%s,%s)
            """,(off_id,path)
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            S3Processing.uploadS3ItemToBucket(
                config.getKey("document_bucket_access_key"),
                config.getKey("document_bucket_access_secret"),
                config.getKey("document_bucket"),
                path,
                "application/json",
                json.dumps(params['client'])
            )
            if 'client' not in params:
                return {'success': False,'message': 'DATA_REQUIRED'}
            inputs = ['name','phone','email','doa','address','attny','language']
            tosave = {}
            line = 0
            LANG = self.getLanguages()
            try: 
                j = params['client'].split('\n')
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
                if 'address' not in tosave:
                    return {'success': False,'message': 'ADDRESS_REQUIRED'}
                addr = pyap.parse(tosave['address'],country='US')
                parsed_address = addr[0]
                street = parsed_address.street_number + " " + parsed_address.street_name
                city = parsed_address.city
                state = parsed_address.region1
                postal_code = parsed_address.postal_code
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
                    UNION ALL
                    select id from referrer_users where sha256=%s
                    """,(sha256,sha256)
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
                    tosave['user_id'] = user_id
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
                    rus_id = self.processRow(off_id,tosave,insid,sha256,db)
            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
                return {'success': False,'message': 'Error on line %s: %s' % (line,str(e))}
        db.commit()
        ret['success'] = True
        return ret
