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

class ClientList(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        inputs = [
                {'l':'Description of accident','f':'description','t':'textfield','v':''},
                {'l':'Hospital','f':'hospital','t':'checkbox','v':0},
                {'l':'Ambulance','f':'ambulance','t':'checkbox','v':0},
                {'l':'Witnesses','f':'witnesses','t':'textfield','v':''},
                {'l':'Reporting Law Enforment Agency','f':'rep_law_enforcement','t':'text','v':''},
                {'l':'Police Report #','f':'police_report_num','t':'text','v':''},
                {'l':'Date of Accident','f':'date_of_accident','t':'text','v':''},
                {'l':'Citations','f':'citations','t':'text','v':''},
                {'l':'Who was cited','f':'citations_person','t':'text','v':''},
                {'l':'Pics of damage','f':'pics_of_damage','t':'checkbox','v':0},
                {'l':'Passengers in Vehicle','f':'passengers','t':'textfield','v':''},
                {'l':'Def Insurance Info','f':'def_insurance','t':'text','v':''},
                {'l':'Claim #/Policy #','f':'def_claim_num','t':'text','v':''},
                {'l':'Def Name#','f':'def_name','t':'text','v':''},
                {'l':'PIP Insurance Info','f':'ins_info','t':'text','v':''},
                {'l':'Claim #/Policy #','f':'ins_claim_num','t':'text','v':''},
                {'l':'Policy Holder','f':'ins_policy_holder','t':'text','v':''},
              ]
        cols = []
        CI = self.getClientIntake()
        for g in inputs:
            cols.append(g['f'])
        o = db.query("""
            select
                ci.id,u.first_name as client_first,
                u.last_name as client_last, 
                oa.name as office_name,
                u.id as user_id,
                concat(u.first_name,' ', u.last_name) as name,
                u.email email, u.phone as phone,
                cis.name as status,cio.id as appt_id,
                cis.id as status_id,
                """ + ','.join(cols) + """
            from
                users u,
                office o,
                office_addresses oa,
                client_intake ci,
                client_intake_status cis,
                client_intake_offices cio
            where
                oa.office_id = o.id and
                oa.id = cio.office_addresses_id and
                cio.client_intake_id = ci.id and
                cis.id = cio.client_intake_status_id and
                ci.user_id = u.id and
                hidden = 0 and
                o.id = cio.office_id and
                o.id=%s and
                cis.id < %s 
            """,(off_id,CI['COMPLETED'])
        )
        ret['clients'] = []
        for x in o:
            j = x
            g = db.query("""
                select fulladdr from user_addresses
                    where user_id = %s
                """,(x['user_id'],)
            )
            j['address'] = ''
            for z in g:
                j['addr'] = z['fulladdr']
            ret['clients'].append(j)
        ret['config'] = {}
        ret['config']['status'] = db.query("""
            select id,name from client_intake_status""")
        return ret

class ClientUpdate(OfficeBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        print(*args,**kwargs)
        db = Query()
        REF = self.getReferrerUserStatus()
        CI = self.getClientIntake()
        db.update("""
            update client_intake_offices set client_intake_status_id = %s
                where client_intake_id = %s and office_id = %s
            """,(params['status_id'],params['id'],off_id)
        )
        if params['status_id'] == CI['SCHEDULED']:
            db.update("""
                update referrer_users set referrer_users_status_id = %s
                    where client_intake_id = %s
                """,(REF['SCHEDULED'],params['id'])
            )
        if params['status_id'] == CI['COMPLETED']:
            db.update("""
                update referrer_users set referrer_users_status_id = %s
                    where client_intake_id = %s
                """,(REF['COMPLETED'],params['id'])
            )
        db.commit()
        ret['success'] = True
        return ret

