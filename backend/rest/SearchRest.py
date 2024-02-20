# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Search


class SearchConfig(RestBase):
    def post(self, *args, **kwargs):
        u = Search.SearchConfig()
        ret = u.process(args[0])
        return ret

class SearchGet(RestBase):
    def post(self, *args, **kwargs):
        u = Search.SearchGet()
        ret = u.process(args[0])
        return ret

class SearchReservation(RestBase):
    def post(self, *args, **kwargs):
        u = Search.SearchReservation()
        ret = u.process(args[0])
        return ret

class SearchRegister(RestBase):
    def post(self, *args, **kwargs):
        u = Search.SearchRegister()
        ret = u.process(args[0])
        return ret

class SearchSchedule(RestBase):
    def post(self, *args, **kwargs):
        u = Search.SearchSchedule()
        ret = u.process(args[0])
        return ret
