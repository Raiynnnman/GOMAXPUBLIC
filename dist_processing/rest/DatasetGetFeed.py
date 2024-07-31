# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.DatasetGet import DatasetGet

class DatasetGetFeed(RestBase):

    def post(self, *args, **kwargs):
        m = DatasetGet()
        ret = m.process(args[0])
        return ret
