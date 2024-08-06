# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.AthleteDataRequest import AthleteDataRequest

class AthleteFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = AthleteDataRequest()
        ret = fdr.process(args[0])
        return ret
