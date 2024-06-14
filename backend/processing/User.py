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
            select zipcode from users u,user_addresses ua
            where user_id=%s""",(user_id,)
        )
        if len(o) < 1:
            return lon,lat
        d = db.query("""
            select lon,lat
            from position_zip 
            where 
                zipcode = %s
            limit 1
            """,(o[0]['zipcode'],)
        )
        if len(o) < 1:
            return lon,lat
        lon = d[0]['lon']
        lat = d[0]['lat']
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

    def getAppointments(self,user,db):
        uid = user['id']
        o = db.query("""
            select 
                o.id,o.name,o.email,
                cio.client_intake_status_id as status_id ,
                cis.name as status
            from
                client_intake ci,
                office o,office_addresses oa,
                client_intake_status cis,
                client_intake_offices cio
            where
                ci.id = cio.client_intake_id and
                cis.id = cio.client_intake_status_id and
                cio.office_id = o.id and
                ci.user_id = %s
            """,(user['id'],)
        )
        return o

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'location' not in params:
            lon,lat = self.getUserLonLat(user['user_id'])
        else:
            lat = params['location']['lat']
            lon = params['location']['lon']
        ret['appt'] = self.getAppointments(user,db)
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
