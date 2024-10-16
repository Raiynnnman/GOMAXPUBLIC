# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import User

class UserConfigRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserConfig()
        ret = u.process(args[0])
        return ret

class UserDocumentsUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserDocumentsUpdate()
        ret = u.process(args[0])
        return ret

class UserSetupIntentRest(RestBase):

    def get(self, *args, **kwargs):
        u = User.UserSetupIntent()
        ret = u.process(args)
        return ret

class UserCardUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserCardUpdate()
        ret = u.process(args[0])
        return ret

class UserDashboardRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserDashboard()
        ret = u.process(args[0])
        return ret

class UserCardUpdateDefaultRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserCardUpdateDefault()
        ret = u.process(args[0])
        return ret

class UserRatingsRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserRatings()
        ret = u.process(args[0])
        return ret

class UserTrackerListRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserTrackerList()
        ret = u.process(args[0])
        return ret

class UserTrackerUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserTrackerUpdate()
        ret = u.process(args[0])
        return ret

class UserTrackerCodeVerifyRest(RestBase):

    def post(self, *args, **kwargs):
        u = User.UserTrackerCodeVerify()
        ret = u.process(args[0])
        return ret
