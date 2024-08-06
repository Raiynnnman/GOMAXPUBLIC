# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.QueryInterface import QueryInterface

class QueryFeed(RestBase):

    def post(self, *args, **kwargs):
        qi = QueryInterface()
        ret = qi.process(args[0])
        return ret
