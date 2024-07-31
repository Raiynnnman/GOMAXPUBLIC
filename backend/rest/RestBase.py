# coding=utf-8

import os
import sys
import json
import traceback
from util.DBOps import Query
import unittest
from flask import request, jsonify, Response, abort
from util import Performance
from common.InvalidCredentials import InvalidCredentials
from common import version
from util.Logging import Logging

log = Logging()

class RestBase:

    def get(self, *args, **kwargs):
        raise Exception("DERIVED_CLASS_MUST_IMPLEMENT")

    def post(self, *args, **kwargs):
        raise Exception("DERIVED_CLASS_MUST_IMPLEMENT")

    def getWrapper(self, *args, **kwargs):
        ret = {}
        perf = Performance.performance()
        perf.start(self.__class__.__name__)
        try: 
           ret['success'] = True
           ret['data'] = self.get(*args, **kwargs)
           ret['execution'] = perf.stop()
           ret['version'] = version.getVersion()
           return jsonify(ret)
        except InvalidCredentials as ic:
           abort(401,jsonify({"success":False,"message":str(ic)}))
        except Exception as e:
           log.error(str(e))
           exc_type, exc_value, exc_traceback = sys.exc_info()
           traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
           abort(500,jsonify({"success":False,"message":str(e)}))
        finally:
            pass

    def postWrapper(self, *args, **kwargs):
        ret = {}
        perf = Performance.performance()
        try: 
            postdata = request.get_json()
            if postdata is None:
                postdata = request.get_data().decode('utf-8')
                postdata = json.loads(postdata or '{}')
            ret['success'] = True
            j = list(args)
            j.append(postdata)
            ret['data'] = self.post(j)
            ret['execution'] = perf.stop()
            ret['version'] = version.getVersion()
            return jsonify(ret)
        except InvalidCredentials as ic:
           log.error(str(ic))
           abort(401,jsonify({"success":False,"message":str(ic)}))
        except Exception as e:
           log.error(str(e))
           exc_type, exc_value, exc_traceback = sys.exc_info()
           traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
           j = list(args)
           j.append(postdata)
           db = Query()
           db.update(""" insert into api_errors (request_path,request_value,stack,error) values 
                (%s,%s,%s,%s)""",(request.path,json.dumps(j),traceback.format_exc(),str(e))
           )
           db.commit()
           abort(500,jsonify({"success":False,"message":str(e)}))
        finally:
            pass

