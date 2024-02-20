# coding=utf-8
import sys
import os
import json
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))

from util.Logging import Logging
from common.InvalidCredentials import InvalidCredentials


def check_admin(val):
    def check(cls,jobid,inp):
        if len(inp) > 1:
            u = inp[0]
            if 'entitlements' in u:
                if 'Admin' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_consultant(val):
    def check(cls,jobid,inp):
        if len(inp) > 1:
            u = inp[0]
            if 'entitlements' in u:
                if 'Consultant' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_corporation(val):
    def check(cls,jobid,inp):
        if len(inp) > 1:
            u = inp[0]
            if 'entitlements' in u:
                if 'Corporation' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_office(val):
    def check(cls,jobid,inp):
        if len(inp) > 1:
            u = inp[0]
            if 'offices' not in u or len(u['offices']) < 1:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check
