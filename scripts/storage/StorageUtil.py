import os
import random
import sys
import requests
import json

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
from util import getIDs

config = settings.config()
config.read("settings.cfg")

class StorageUtil:
    def __init__(self):
        pass
    def getAuthHeader(self):
        s = config.getKey("pain_api_key")
        if s is None:
            raise Exception("API_KEY_REQUIRED")
        return "Bearer %s" % s

    def post(self,endpoint,data=None):
        headers = {
            'Authorization': self.getAuthHeader(), 
            'Content-Type':'application/json'
        }
        u = "%s%s" % (config.getKey("api_url"),endpoint)
        r = requests.post(u,json=data,headers=headers)
        if r.status_code != 200:
            raise Exception("REQUEST_FAILED: %s" % str(r.text))
        js = json.loads(r.text)
        return js



