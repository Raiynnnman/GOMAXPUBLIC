# coding=utf-8

import sys
import os
import json
import unittest
import jwt
import base64
import mimetypes
import dateutil 

from util import encryption,calcdate
from util import S3Processing
from util.UploadDocument import uploadDocument
from processing import Stripe
from util.Logging import Logging
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

class UserBase(SubmitDataRequest):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getUserLonLat(self,user_id):
        db = Query()
        lat = 0
        lon = 0
        o = db.query(""" 
            select lat,lon from 
                user_location 
            where 
                user_id=%s  
            order by 
                created desc 
            limit 1""",(user_id,)
        )
        if len(o) < 1:
            return lon,lat
        lon = o[0]['lon']
        lat = o[0]['lat']
        return lon,lat
        

class UserConfig(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        lat = lon = 0
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'location' not in params:
            lon,lat = self.getUserLonLat(user['user_id'])
        else:
            lat = params['location']['lat']
            lon = params['location']['lon']
        return ret

class UserDashboard(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getAppointments(self,user,db,lat,lon):
        uid = user['id']
        print(uid)
        o = db.query("""
            select
                oa.id,o.id as office_id,
                o.name as office_name,
                JSON_OBJECT(
                    'id',oa.id,'addr1',concat(oa.addr1,' ',ifnull(oa.addr2,'')),'phone',oa.phone,
                    'lat',oa.lat,'lon',oa.lon, 'city',oa.city,'state',
                    oa.state,'zipcode',oa.zipcode
                ) as addr,cio.id as appt_id,
                st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192 as miles
            from
                office_addresses oa,
                office o,
                client_intake ci,
                referrer_users ru,
                client_intake_offices cio,
                provider_queue pq
            where
                pq.office_id = o.id and
                cio.client_intake_id = ci.id and
                ru.client_intake_id = ci.id and
                oa.office_id = o.id and
                oa.id = ru.office_addresses_id and
                ru.user_id = %s
            """,(lon,lat,user['id'],)
        )
        ret = []
        for x in o:
            x['addr'] = json.loads(x['addr'])
            if lat == 0:
                x['miles'] = 0
            x['profile'] = db.query("""
            select
                o.id as office_id,o.name,oa.phone,
                u.first_name,u.last_name,u.title,
                pm.headshot,pm.video,u.id as phy_id
            from
                users u
                left join office_user ou on ou.user_id = u.id
                left join office o on o.id = ou.office_id
                left join office_addresses oa on oa.office_id=o.id
                left join provider_queue pq on o.id = pq.office_id 
                left outer join office_provider_media pm on pm.user_id = u.id
            where
                o.id = %s
            """,(x['office_id'],)
            )
            x['rating'] = db.query(
                "select ifnull(round(avg(rating),2),0) as avg from ratings where office_id=%s",(x['office_id'],)
            )
            if len(x['rating']) > 0:
                x['rating'] = x['rating'][0]['avg']
            else:
                x['rating'] = 0
            ret.append(x)
            print(ret)
        return ret

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'location' not in params:
            lon,lat = self.getUserLonLat(user['user_id'])
        else:
            lat = params['location']['lat']
            lon = params['location']['lon']
        ret['appt'] = self.getAppointments(user,db,lat,lon)
        return ret
            
class UserRatings(UserBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'appt_id' not in params:
            return {'success':True}
        q = db.query(""" select user_id from physician_schedule 
            where id=%s
            """,(params['appt_id'],)
        )
        val = 0
        if len(q) < 1:
            return {'success':True}
        try:
           val = int(params['rating']) 
           if val < 1:
                val = val * -1
        except:
            return {'success':True}
        user_id = q[0]['user_id']
        if not params['text']:
            params['text'] = ''
        # TODO: Filter out bad words and other content
        db.update("""
            delete from ratings where physician_schedule_id=%s
            """,(params['appt_id'],)
        )
        db.update("""
            insert into ratings (user_id,physician_schedule_id,rating,text) 
            values (%s,%s,%s,%s)
            """,(user_id,params['appt_id'],val,params['text'])
        )
        db.commit()
        return {'success':True}
