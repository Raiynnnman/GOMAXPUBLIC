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

class LocationUpdate(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        if 'addr' not in params or params['addr'] is None:
            return {'success':False,'message':'MISSING_REQUIRED_DATA'}
        for x in params['addr']:
            if 'fulladdr' not in x:
                x['fulladdr'] = ''
            if 'addr2' not in x:
                x['addr2'] = ''
            if 'name' not in x:
                continue
            if 'city' not in x:
                x['city'] = ''
            if 'phone' not in x:
                x['phone'] = ''
            if 'state' not in x:
                x['state'] = ''
            if 'id' in x:
                db.update("""
                    update office_addresses set name = %s,
                        addr1=%s,addr2=%s,city=%s,state=%s,zipcode=%s,phone=%s,
                        lat=0,lon=0,places_id=null,lat_attempt_count=0,
                        nextcheck=null
                        where id = %s
                    """,(x['name'],
                         x['addr1'],
                         x['addr2'],
                         x['city'],
                         x['state'],
                         x['zipcode'],
                         x['phone'],
                         x['id'])
                )
                if 'deleted' in params and params['deleted']:
                    db.update("""
                        update office_addresses set deleted = 1
                        where id=%s
                        """,(x['id'],)
                    )
            else:
                db.update("""
                    insert into office_addresses (
                        office_id,name,addr1,addr2,city,state,zipcode,phone,full_addr)
                        values (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,(off_id,x['name'],
                         x['addr1'],
                         x['addr2'],
                         x['city'],
                         x['state'],
                         x['zipcode'],
                         x['phone'],
                         x['fulladdr']
                    )
                )
        db.commit()
        ret['success'] = True
        return ret

class LocationList(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        o = db.query("""
            select 
                oa.id,oa.name,oa.phone,oa.addr1,oa.addr2,
                    oa.city,oa.state,oa.zipcode,
                    oa.lat as lat, oa.lon as lng
            from 
                office_addresses oa
            where oa.deleted = 0 and oa.office_id = %s
            
            """,(off_id,)
        )
        ret['locations'] = []
        for x in o:
            if x['id'] is None:
                continue
            if x['addr1'] is None:
                continue
            x['providers'] = db.query("""
                select 
                    u.id,u.email,u.first_name,u.last_name,
                    opa.text,opm.headshot
                from 
                    office_addresses oa
                    left join office_providers op on op.office_addresses_id = oa.id
                    left join users u on op.user_id = u.id
                    left outer join office_provider_about opa on opa.user_id=u.id
                    left outer join office_provider_media opm on opm.user_id=u.id
                where oa.id=%s
                """,(x['id'],)
            ) 
            ret['locations'].append(x)
        db.commit()
        ret['success'] = True
        return ret
