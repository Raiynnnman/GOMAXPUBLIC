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

class BacklinkDataRequest(InsertDataRequest):
    
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class AnchorDataRequest(InsertDataRequest):

    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class TrafficSourceDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class TrafficDestinationDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class OrganicWordSearchDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class PaidWordSearchDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class TrafficByCountryDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class BounceRateDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class PagesPerVisitDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class AvgVisitDurationDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class UniqueVisitorsDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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

class TotalVisitorsDataRequest(InsertDataRequest):
    def execute(self, *args, **kwargs):
        mydata = args[0]
        table = "semrush"
        category = "sportsbiz.semrush"
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
