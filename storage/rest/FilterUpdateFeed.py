# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.FilterUpdate import FilterUpdate

class FilterUpdateFeed(RestBase):

    def post(self, *args, **kwargs):
        m = FilterUpdate()
        ret = m.process(args[0])
        return ret
