# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.QueryUpdate import QueryUpdate

class QueryUpdateFeed(RestBase):

    def post(self, *args, **kwargs):
        m = QueryUpdate()
        ret = m.process(args[0])
        return ret
