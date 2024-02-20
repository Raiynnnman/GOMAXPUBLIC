# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Corporation

class UsersListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Corporation.CorporationUserList()
        ret = u.process(args[0])
        return ret

class UsersUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Corporation.CorporationUserUpdate()
        ret = u.process(args[0])
        return ret
