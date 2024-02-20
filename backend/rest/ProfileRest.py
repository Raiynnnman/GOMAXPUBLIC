# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.Profile import Profile

class ProfileRest(RestBase):

    def get(self, *args, **kwargs):
        u = Profile()
        ret = u.process(args[0])
        return ret
