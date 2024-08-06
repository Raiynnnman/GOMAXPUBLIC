# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.FilterCreate import FilterCreate

class FilterCreateFeed(RestBase):

    def post(self, *args, **kwargs):
        m = FilterCreate()
        ret = m.process(args[0])
        return ret
