# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Office
from processing.Context import GetContext,DelContext

class OfficeListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.OfficeList()
        ret = u.process(args[0])
        return ret

class OfficeSaveRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.OfficeSave()
        ret = u.process(args[0])
        return ret

class GetContextRest(RestBase):

    def post(self, *args, **kwargs):
        u = GetContext()
        ret = u.process(args[0])
        return ret

class DelContextRest(RestBase):

    def post(self, *args, **kwargs):
        u = DelContext()
        ret = u.process(args[0])
        return ret



