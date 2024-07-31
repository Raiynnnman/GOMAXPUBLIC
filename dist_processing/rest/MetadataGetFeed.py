# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.MetadataGet import MetadataGet

class MetadataGetFeed(RestBase):

    def get(self, *args, **kwargs):
        m = MetadataGet()
        ret = m.process(*args, **kwargs)
        return ret
