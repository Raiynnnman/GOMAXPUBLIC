# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.QueryList import QueryList

class QueryListFeed(RestBase):

    def post(self, *args, **kwargs):
        m = QueryList()
        ret = m.process(args[0])
        return ret
