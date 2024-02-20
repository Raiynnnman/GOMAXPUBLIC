# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Registrations

class RegistrationUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Registrations.RegistrationUpdate()
        ret = u.process(args[0])
        return ret


class RegistrationListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Registrations.RegistrationList()
        ret = u.process(args[0])
        return ret

class RegistrationLandingDataRest(RestBase):

    def post(self, *args, **kwargs):
        u = Registrations.RegistrationLandingData()
        ret = u.process(args[0])
        return ret

class RegistrationVerifyRest(RestBase):

    def post(self, *args, **kwargs):
        u = Registrations.RegistrationVerify()
        ret = u.process(args[0])
        return ret


