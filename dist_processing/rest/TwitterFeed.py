# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.TwitterDataRequest import TwitterDataRequest

class TwitterFeed(RestBase):
    def post(self, *args, **kwargs):
        tdr = TwitterDataRequest()
        ret = tdr.process(args[0])
        return ret