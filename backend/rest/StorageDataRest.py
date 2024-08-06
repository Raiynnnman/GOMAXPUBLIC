# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.StoreData import StoreData

class StoreDataRest(RestBase):

    def post(self, *args, **kwargs):
        fdr = StoreData()
        ret = fdr.process(args[0])
        return ret
