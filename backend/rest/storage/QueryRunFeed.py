# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from rest.RestBase import RestBase
from processing.QueryRun import QueryRun
class QueryRunFeed(RestBase):
    
    def post(self, *args, **kwargs):
        qrf = QueryRun()
        ret = qrf.process(args[0])
        return ret





