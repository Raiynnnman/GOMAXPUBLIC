# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Consultant

class ConsultantConfigRest(RestBase):
    def post(self, *args, **kwargs):
        u = Consultant.ConsultantConfig()
        ret = u.process(args[0])
        return ret

class ConsultantDashboardRest(RestBase):
    def get(self, *args, **kwargs):
        u = Consultant.ConsultantDashboard()
        ret = u.process(args)
        return ret

class ConsultantBillingRest(RestBase):
    def post(self, *args, **kwargs):
        u = Consultant.ConsultantBilling()
        ret = u.process(args[0])
        return ret

class ConsultantBillingDownloadDocRest(RestBase):
    def post(self, *args, **kwargs):
        u = Consultant.ConsultantBillingDownloadDoc()
        ret = u.process(args[0])
        return ret

class ConsultantScheduleUpdateRest(RestBase):
    def post(self, *args, **kwargs):
        u = Consultant.UpdateSchedule()
        ret = u.process(args[0])
        return ret
