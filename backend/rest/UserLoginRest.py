# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify
import pdb
from rest.RestBase import RestBase
from processing import UserLogin

class UserLoginRest(RestBase):

    def post(self, *args, **kwargs):
        u = UserLogin.UserLogin()
        ret = u.process(args[0])
        return ret

class ResetPasswordWithTokenRest(RestBase):

    def post(self, *args, **kwargs):
        u = UserLogin.ResetPasswordWithToken()
        ret = u.process(args[0])
        return ret

class RequestTokenRest(RestBase):

    def post(self, *args, **kwargs):
        u = UserLogin.ResetPasswordGetToken()
        ret = u.process(args[0])
        return ret
