# coding=utf-8

import sys
import os
import json
import requests
from util.Logging import Logging
from util import encryption,calcdate
from common import settings

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

    def payInvoice(self,inv_id,body):
        key = self.getKey()
        ret = {}
        u = "%s/invoice/%s/pay" % (self.__url__,inv_id)
        headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer %s' % key,
          'Accept': 'application/json'
        }
        r = requests.post(u,data=json.dumps(body),headers=headers)
        print(r.status_code)
        ret = json.loads(r.text)
        print(json.dumps(ret,indent=4))
        if r.status_code != 200:
            raise Exception("Failed to process invoice: %s" % (ret))
        return ret
        
    def createInvoice(self,body):
        key = self.getKey()
        ret = {}
        print(json.dumps(body,indent=4))
        headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer %s' % key,
          'Accept': 'application/json'
        }
        r = requests.post('https://apiprod.fattlabs.com/invoice', data=json.dumps(body), headers=headers)
        print(r.status_code)
        ret = json.loads(r.text)
        print(json.dumps(ret,indent=4))
        if r.status_code != 200:
            raise Exception("Failed to process invoice: %s" % (ret))
        return ret



