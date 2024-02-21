# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Legal

class LegalConfigRest(RestBase):
    def post(self, *args, **kwargs):
        u = Legal.LegalConfig()
        ret = u.process(args[0])
        return ret

class LegalDashboardRest(RestBase):
    def get(self, *args, **kwargs):
        u = Legal.LegalDashboard()
        ret = u.process(args)
        return ret

class LegalBillingRest(RestBase):
    def post(self, *args, **kwargs):
        u = Legal.LegalBilling()
        ret = u.process(args[0])
        return ret

class LegalBillingDownloadDocRest(RestBase):
    def post(self, *args, **kwargs):
        u = Legal.LegalBillingDownloadDoc()
        ret = u.process(args[0])
        return ret

class LegalScheduleUpdateRest(RestBase):
    def post(self, *args, **kwargs):
        u = Legal.UpdateSchedule()
        ret = u.process(args[0])
        return ret
