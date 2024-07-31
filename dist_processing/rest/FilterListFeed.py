# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify
from util.DBManager import DBManager 

from rest.RestBase import RestBase
from processing.FilterList import FilterList

class FilterListFeed(RestBase):

    def post(self, *args, **kwargs):
        m = FilterList()
        ret = m.process(args[0])
        return ret
