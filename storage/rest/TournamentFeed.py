# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.TournamentDataRequest import TournamentDataRequest

class TournamentFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = TournamentDataRequest()
        ret = fdr.process(args[0])
        return ret
