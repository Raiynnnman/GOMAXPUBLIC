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
from util.Permissions import check_datascience


class StoreData(SubmitDataRequest):

    def isDeferred(self):
        return True
    
    @check_datascience
    def execute(self, *args, **kwargs):
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        ret = {}
        if 'table' not in params:
            raise Exception("TABLE_NAME_REQUIRED")
        if 'data' not in params:
            raise Exception("DATA_REQUIRED")
        if not isinstance(params['data'],list):
            raise Exception("DATA_LIST_REQUIRED")
        if len(params['data']) < 1:
            return {'success': True}
        table = params['table']
        category = "pain.%s" % table
        se = SparkEntry()
        ret = se.process(category, table, params['data']) 
        ret['success'] = True
        return ret
