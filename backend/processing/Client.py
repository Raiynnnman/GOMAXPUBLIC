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
from processing.User import UserBase
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from processing import User
from util.Permissions import check_user
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class ClientBase(UserBase):

    def __init__(self):
        super().__init__()

class AppointmentList(ClientBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_user
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        lon,lat = self.getUserLonLat(user['id'])
        db = Query()
        ret['location'] = {'lng':lon,'lat':lat}
        ret['center'] = {'lng':lon,'lat':lat}
        ret['appt'] = []
        ret['config'] = {}
        uid = user['id']
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

        for x in o:
            x['addr'] = json.loads(x['addr'])
            ret['destination'] = {
                'lng': x['addr']['lon'],
                'lat': x['addr']['lat']
            }
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
            ret['appt'].append(x)
        return ret

