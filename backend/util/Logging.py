
import sys
import os
import json
import time
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))
from common import settings
from util import calcdate

config = settings.config()
config.read("settings.cfg")

class Logging:

    def debug(self,m):
        if config.getKey("debug") is None:
            return
        if config.getKey("debug") == 0:
            return
        print("DBG:%s:%s" % (calcdate.getTimestampNow(),m))

    def info(self,m):
        print("IFO:%s:%s" % (calcdate.getTimestampNow(),m))

    def error(self,m):
        print("ERR:%s:%s" % (calcdate.getTimestampNow(),m))
