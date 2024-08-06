# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.ResultGet import ResultGet

class ResultGetFeed(RestBase):

    def post(self, *args, **kwargs):
        m = ResultGet()
        ret = m.process(args[0])
        return ret
