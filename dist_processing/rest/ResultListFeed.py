# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.ResultList import ResultList

class ResultListFeed(RestBase):

    def post(self, *args, **kwargs):
        m = ResultList()
        ret = m.process(args[0])
        return ret
