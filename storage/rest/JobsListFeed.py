# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.JobsList import JobsList

class JobsListFeed(RestBase):

    def post(self, *args, **kwargs):
        m = JobsList()
        ret = m.process(args[0])
        return ret
