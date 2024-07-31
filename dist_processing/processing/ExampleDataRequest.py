# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from sparks.SparkEntry import SparkEntry

class ExampleDataRequest(SubmitDataRequest):
    
    def execute(self, *args, **kwargs):
        table = "example"
        category = "sportsbiz.example"
        se = SparkEntry()
        ret = se.process(category, table, args[0])
        ret['success'] = True
        return ret
