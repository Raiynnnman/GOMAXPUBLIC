# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Leads

class LeadsListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Leads.LeadsList()
        ret = u.process(args[0])
        return ret

class LeadsUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Leads.LeadsUpdate()
        ret = u.process(args[0])
        return ret

class LeadsStatusUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Leads.LeadsStatusUpdate()
        ret = u.process(args[0])
        return ret
