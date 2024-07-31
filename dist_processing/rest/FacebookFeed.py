# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.FacebookDataRequest import FacebookDataRequest

class FacebookFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = FacebookDataRequest()
        ret = fdr.process(args[0])
        return ret
