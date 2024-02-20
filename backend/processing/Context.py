# coding=utf-8

import sys
import os
import json
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))

from util.Permissions import check_admin
from util import encryption
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

class GetContext(SubmitDataRequest):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'office' not in params:
            raise Exception("OFFICE_REQUIRED")
        db = Query()
        db.update(
            """
                delete from context where user_id = %s
            """,(user['user_id'],)
        )
        db.update(
            """
                insert into context (user_id,office_id) values (%s,%s)
            """,(user['user_id'],params["office"])
        )
        db.commit()
        ret['success'] = True
        return ret

class DelContext(SubmitDataRequest):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        db.update(
            """
                delete from context where user_id = %s
            """,(user['user_id'],)
        )
        db.commit()
        return ret
