# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.DatasetList import DatasetList

class DatasetListFeed(RestBase):

    def post(self, *args, **kwargs):
        m = DatasetList()
        ret = m.process(args[0])
        return ret
