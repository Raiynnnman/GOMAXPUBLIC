# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.ExportData import ExportData

class ExportFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = ExportData()
        ret = fdr.process(args[0])
        return ret
