# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.DatasetUpdate import DatasetUpdate

class DatasetUpdateFeed(RestBase):

    def post(self, *args, **kwargs):
        m = DatasetUpdate()
        ret = m.process(args[0])
        return ret
