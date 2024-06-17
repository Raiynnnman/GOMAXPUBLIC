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
from util.Permissions import check_user
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class ClientBase(SubmitDataRequest):

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
        return {'success': True}

