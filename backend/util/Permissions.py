# coding=utf-8
import sys
import os
import json
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))

from util.Logging import Logging
from common.InvalidCredentials import InvalidCredentials


def check_crm(val):
    def check(cls,jobid,inp):
        if len(inp) > 1 or len(inp) == 1:
            u = {}
            if isinstance(inp,list):
                u = inp[0]
            elif isinstance(inp,tuple):
                u = inp[0]
            else:
                u = dict(inp)
            if 'entitlements' in u:
                if 'Admin' not in u['entitlements'] and 'CRMUser' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_admin(val):
    def check(cls,jobid,inp):
        print("inp=%s" % inp)
        if len(inp) > 1 or len(inp) == 1:
            u = {}
            if isinstance(inp,list):
                u = inp[0]
            elif isinstance(inp,tuple):
                u = inp[0]
            else:
                u = dict(inp)
            if 'entitlements' in u:
                if 'Admin' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_legal(val):
    def check(cls,jobid,inp):
        if len(inp) > 1:
            u = {}
            if isinstance(inp,list):
                u = inp[0]
            else:
                u = inp
            if 'entitlements' in u:
                if 'Legal' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_corporation(val):
    def check(cls,jobid,inp):
        if len(inp) > 1:
            u = {}
            if isinstance(inp,list):
                u = inp[0]
            else:
                u = inp
            if 'entitlements' in u:
                if 'Corporation' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_office(val):
    def check(cls,jobid,inp):
        if len(inp) > 1:
            u = {}
            if isinstance(inp,list):
                u = inp[0]
            else:
                u = inp
            if 'offices' not in u or len(u['offices']) < 1:
                raise InvalidCredentials("ACCESS_REQUIRED")
        else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_bdr(val):
    def check(cls,jobid,inp):
        if len(inp) > 1 or len(inp) == 1:
            u = {}
            if isinstance(inp,list):
                u = inp[0]
            elif isinstance(inp,tuple):
                u = inp[0]
            else:
                u = dict(inp)
            if 'entitlements' in u:
                if 'BusinessDevelopmentRepresentative' not in u['entitlements'] and \
                   'AccountExecutive' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

def check_user(val):
    def check(cls,jobid,inp):
        if len(inp) > 1 or len(inp) == 1:
            u = {}
            if isinstance(inp,list):
                u = inp[0]
            elif isinstance(inp,tuple):
                u = inp[0]
            else:
                u = dict(inp)
            if 'entitlements' in u:
                if 'Customer' not in u['entitlements']:
                    raise InvalidCredentials("ACCESS_REQUIRED")
            else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        else:
                raise InvalidCredentials("ACCESS_REQUIRED")
        return val(cls,jobid,inp)
    return check

