# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.ExampleDataRequest import ExampleDataRequest

class ExampleFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = ExampleDataRequest()
        ret = fdr.process(args[0])
        return ret
