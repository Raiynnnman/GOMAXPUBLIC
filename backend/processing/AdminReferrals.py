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
from util import tzInfo
from util import S3Processing
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Admin import AdminBase
from processing import OfficeReferrals 
from processing.Audit import Audit
from processing import Search,Office
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin,check_bdr,check_crm
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class ReferrerUpdate(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        ref_id = 0
        print(params)
        if 'id' in params:
            ref_id = params['id']
        if 'referrer_users_source_id' in params:
            db.update("""
                update referrer_users set referrer_users_source_id=%s
                where id = %s
                """,(params['referrer_users_source_id'],ref_id)
            )
        if 'referrer_users_vendor_status_id' in params:
            db.update("""
                update referrer_users set referrer_users_vendor_status_id=%s
                where id = %s
                """,(params['referrer_users_vendor_status_id'],ref_id)
            )
        if 'phone' in params:
            db.update("""
                update referrer_users set phone=%s
                where id = %s
                """,(params['phone'],ref_id)
            )
        if 'email' in params:
            db.update("""
                update referrer_users set email=%s
                where id = %s
                """,(params['email'],ref_id)
            )
        if 'referrer_users_call_status_id' in params:
            db.update("""
                update referrer_users set referrer_users_call_status_id=%s
                where id = %s
                """,(params['referrer_users_call_status_id'],ref_id)
            )
        if 'referrer_users_status_id' in params:
            db.update("""
                update referrer_users set referrer_users_status_id=%s
                where id = %s
                """,(params['referrer_users_status_id'],ref_id)
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
                    insert into referrer_users_comment(user_id,referrer_users_id,text)
                    values 
                    (%s,%s,%s)
                    """,(user['user_id'],ref_id,bb2)
                )
                db.update("""
                    insert into referrer_users_history(referrer_users_id,user_id,text) values
                        (%s,%s,%s)""",(ref_id,user['id'],"ADDED_COMMENT")
                )
        db.commit()
        return {'success': True}

class ReferrerList(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10000
        tz_off = 0
        TZ = tzInfo.getTZ()
        print(params)
        if 'timezone' in params and params['timezone'] in TZ:
             tz_off = TZ[params['timezone']]
        if 'limit' in params:
            limit = params['limit']
        offset = 0
        if 'offset' in params:
            offset = params['offset']
        if 'search' in params:
            if params['search'] == None or len(params['search']) == 0:
                del params['search']
        db = Query()
        ret['config'] = {}
        ret['config']['status'] = db.query("select id,name from referrer_users_status")
        ret['config']['source'] = db.query("select id,name from referrer_users_source")
        ret['config']['call_status'] = db.query("select id,name from referrer_users_call_status")
        ret['config']['vendor_status'] = db.query("select id,name from referrer_users_vendor_status")
        q = """
            select 
                ru.id,ru.email,ru.name,ru.phone,o.name as office_name,ru.referred,
                ru.referrer_users_status_id, rs.name as status,ru.zipcode,
                ro.name as referrer_name,ru.doa,
                o.id as office_id, 
                referrer_users_source_id,referrer_users_vendor_status_id,
                vendor_id, referrer_users_call_status_id,price_per_lead,import_location,
                date_add(ru.created,interval -%s hour) as created,
                date_add(ru.updated,interval -%s hour) as updated,
                timestampdiff(minute,ru.created,now()) as time
            from 
                referrer_users ru
                left join referrer_users_status rs on ru.referrer_users_status_id=rs.id
                left outer join office ro on ru.referrer_id=ro.id
                left outer join referrer_users_vendor_status ruvs on ru.referrer_users_vendor_status_id=ruvs.id
                left outer join referrer_users_source rus on rus.id = ru.referrer_users_source_id
                left outer join referrer_users_call_status rcs on rcs.id = ru.referrer_users_call_status_id
                left outer join office o on o.id = ru.office_id
            where 
                1 = 1
            """ % (tz_off,tz_off)
        p = []
        if 'status' in params and params['status'] is not None and len(params['status']) > 0:
            q += " and ("
            arr = []
            for z in params['status']:
                arr.append("referrer_users_status_id = %s " % z)
            q += " or ".join(arr)
            q += ")"
        print(q)
        cnt = db.query("select count(id) as cnt from (%s) as t" % (q,))
        ret['total'] = cnt[0]['cnt']
        p.append(limit)
        p.append(offset*limit)
        q += " order by updated desc " 
        q += " limit %s offset %s " 
        o = db.query(q,p)
        ret['data'] = []
        for g in o:
            g['last_comment'] = ''
            g['comments'] = []
            g['history'] = []
            g['assignee'] = db.query("""
                    select
                        u.id,u.first_name,u.last_name
                    from
                        office_user ou, users u
                    where
                        ou.user_id=u.id
                        and office_id=%s
                    UNION
                    select
                        u.id,u.first_name,u.last_name
                    from users u
                    where id in
                    (select user_id
                        from user_entitlements ue,entitlements e
                        where ue.entitlements_id=e.id and e.name='Admin')
                    UNION ALL
                    select 1,'System',''
                    """,(g['id'],)
            )
            comms = db.query("""
                select 
                    ic.id,ic.text,ic.user_id,
                    u.first_name,u.last_name,u.title,
                    ic.created
                from 
                referrer_users_comment ic, users u
                where ic.user_id = u.id and referrer_users_id=%s
                order by ic.created desc
                """,(g['id'],)
            )
            for cc in comms: 
                # This happens when we switch environments, just skip
                try:
                    bb2 = encryption.decrypt(
                        cc['text'],
                        config.getKey('encryption_key')
                        )
                    cc['text'] = bb2
                    g['comments'].append(cc)
                    g['last_comment'] = bb2
                except:
                    pass
            g['history'] = db.query("""
                select ph.id,user_id,text,concat(u.first_name, ' ', u.last_name) as user,ph.created
                    from referrer_users_history ph,users u
                where 
                    ph.user_id=u.id and
                    ph.referrer_users_id = %s
                order by created desc
                """,(g['id'],)
            )
            ret['data'].append(g)
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
            j = {}
            if isinstance(params['value'],dict):
                tosave = params['value']
            else:
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
            if 'address' in tosave:
                api_key=config.getKey("google_api_key")
                gmaps = googlemaps.Client(key=api_key)
                # addr = pyap.parse(tosave['address'],country='US')
                addr = gmaps.geocode(tosave['address'])
                if len(addr) > 0:
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
                    tosave['fulladdr'] = tosave['address'] 
            if 'language' not in tosave:
                tosave['language'] = LANG['English']
            else:
                tosave['language'] = LANG[tosave['language']]
            if 'address' in tosave:
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
                if 'email' not in tosave:
                    tosave['email'] = "unknown-%s@poundpainunknown.com" % encryption.getSHA256()[:6]
                db.update("""
                    insert into users (email, first_name, last_name, phone ) values (%s,%s,%s,%s)
                    """,(tosave['email'],first,last,tosave['phone'])
                )
                user_id = db.query("select LAST_INSERT_ID()");
                user_id = user_id[0]['LAST_INSERT_ID()']
                if 'addr1' in tosave:
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
                r1 = OfficeReferrals.ReferrerUpdate()
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
                rus_id = r1.processRow(1,tosave,insid,sha256,db,dest_office_id=dest_office_id,status=status)
                db.commit()
        except Exception as e:
            print(str(e))
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
            return {'success': False,'message': 'Error on line %s: %s' % (line,str(e))}
        return {'success': True}
