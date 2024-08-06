# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.EventSocialsDataRequest import EventSocialsDataRequest

class EventSocialsFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = EventSocialsDataRequest()
        ret = fdr.process(args[0])
        return ret
