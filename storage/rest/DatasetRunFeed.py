# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from rest.RestBase import RestBase
from processing.DatasetRun import DatasetRun


class DatasetRunFeed(RestBase):
    
    def post(self, *args, **kwargs):
        qrf = DatasetRun()
        ret = qrf.process(args[0])
        return ret





