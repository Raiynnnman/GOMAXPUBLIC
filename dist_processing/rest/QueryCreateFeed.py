# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.QueryCreate import QueryCreate

class QueryCreateFeed(RestBase):

    def post(self, *args, **kwargs):
        m = QueryCreate()
        ret = m.process(args[0])
        return ret
