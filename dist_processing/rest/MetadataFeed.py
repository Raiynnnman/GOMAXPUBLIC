# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.Metadata import Metadata

class MetadataFeed(RestBase):

    def get(self, *args, **kwargs):
        m = Metadata()
        ret = m.process(*args, **kwargs)
        return ret
