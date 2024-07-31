# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify, Response

class RestBase:

    def get(self, *args, **kwargs):
        raise Exception("DERIVED_CLASS_MUST_IMPLEMENT")

    def post(self, *args, **kwargs):
        raise Exception("DERIVED_CLASS_MUST_IMPLEMENT")

    def getWrapper(self, *args, **kwargs):
        ret = {}
        ret['data'] = self.get(*args, **kwargs)
        return jsonify(ret)

    def postWrapper(self, *args, **kwargs):
        ret = {}
        postdata = request.get_json()
        if postdata is None:
            postdata = request.get_data().decode('utf-8')
            postdata = json.loads(postdata or '{}')
        ret['data'] = self.post(postdata)
        if isinstance(ret['data'],Response):
            return ret['data']
        return jsonify(ret)

