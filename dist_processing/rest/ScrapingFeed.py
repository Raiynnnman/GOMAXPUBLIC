# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.ScrapingDataRequest import ScrapingDataRequest

class ScrapingFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = ScrapingDataRequest()
        ret = fdr.process(args[0])
        return ret
