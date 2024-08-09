# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import StoreData, Metadata

class StoreDataRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = StoreData.StoreData()
        ret = fdr.process(args[0])
        return ret

class MetaDataRefreshRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = Metadata.MetadataRefresh()
        ret = fdr.process(args[0])
        return ret
