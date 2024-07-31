# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from processing.InsertDataRequest import InsertDataRequest
from processing.FilterList import FilterList

class TwitterDataRequest(InsertDataRequest):
    
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "twitter"
        category = "sportsbiz.twitter"
        filts = FilterList()
        # TODO: Need to make this return specifics not just grab the whole list
        filters = filts.execute({"limit":1000,"page":0})
        mysubmitdata = self.handleFilters(table, filters, mydata)
        self.insertDataFromFilter(mysubmitdata)
        # se = SparkEntry()
        # ret = se.process(category, table, args[0])
        ret = {}
        ret['success'] = True
        return ret
