# coding=utf-8

import sys
import os
import json
import requests

log = Logging()
config = settings.config()
config.read("settings.cfg")

class StaxxPayments:

    __url__ = 'https://apiprod.fattlabs.com'
    
    def __init__(self):
        pass

    def getKey(self):
        key = config.getKey('staxx_api_key')
        if not key:
            raise Exception("STAXX_KEY_UNDEFINED")
        return key

    def createCustomer(self,cust):
        key = self.getKey()

    def createCustomer(self,cust):
        pass
