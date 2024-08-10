# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import DataScienceStoreData, DataScienceMetaData, QueryList
from processing import QueryUpdate, JobsList, MetadataGet

class StoreDataRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = DataScienceStoreData.DataScienceStoreData()
        ret = fdr.process(args[0])
        return ret

class MetaDataRefreshRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = DataScienceMetaData.DataScienceMetadataRefresh()
        ret = fdr.process(args[0])
        return ret

class QueryListRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = QueryList.QueryList()
        ret = fdr.process(args[0])
        return ret

class QueryUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = QueryUpdate.QueryUpdate()
        ret = fdr.process(args[0])
        return ret

class JobsListRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = JobsList.JobsList()
        ret = fdr.process(args[0])
        return ret

class MetadataGetRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = MetadataGet.MetadataGet()
        ret = fdr.process(args[0])
        return ret
