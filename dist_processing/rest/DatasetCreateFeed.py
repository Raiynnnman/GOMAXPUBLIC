# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.DatasetCreate import DatasetCreate

class DatasetCreateFeed(RestBase):

    def post(self, *args, **kwargs):
        m = DatasetCreate()
        ret = m.process(args[0])
        return ret
