# coding=utf-8

import unittest
import json
import base64
import datetime
import copy
from common import settings
from util import calcdate
from util import S3Processing
import pyduktape
from processing.SavedErrorData import SavedErrorData
from processing.SavedLogData import SavedLogData

config = settings.config()
config.read('settings.cfg')

class Results(object):
    def __init__(self):
        self.data = []

    def add(self, p):
        inc = p
        self.data.append(inc)

    def get(self):
        ret = []
        for n in self.data:
            val = n
            if isinstance(n, bytes) or isinstance(n, str):
                val = base64.b64decode(n)
                # print(type(val))
                val = json.loads(val)
            ret.append(val)
        # print("ret=%s" % ret)
        return ret


class JavascriptEngine:

    def evaluator(self, script, data):
        internal_js_post = ""
        internal_js_pre = ""
        with open('processing/javascript/main.js') as x:
            internal_js_pre = x.read()
        with open('processing/javascript/exit.js') as x:
            internal_js_post = x.read()
        execute_js = "var toexec = function() { \n %s \n }" % script
        variables_js = """
            var input = {
                data: %s
            }
        """ % (json.dumps(data),)
        total_js = internal_js_pre + "\n"
        total_js += "/* DATA */" + "\n"
        total_js += variables_js + "\n"
        total_js += "/* SCRIPT */" + "\n"
        total_js += execute_js + "\n"
        total_js += internal_js_post + "\n"
        return total_js

    def process(self, jobid, name, script, data):
        ctx = pyduktape.DuktapeContext()
        result = {}
        myret = {}
        DATA=Results()
        LOG=Results()
        myjs = ''
        try:
            print("Running: %s" % name)
            myjs = self.evaluator(script,data)
            ctx.set_globals(DATA=DATA,LOG=LOG)
            res = ctx.eval_js(myjs)
            resdata = DATA.get()
            print("LOG: %s" % LOG.get())
            myret = resdata
            toup = {
                "name": name,
                "class": self.__class__.__name__,
                "log" : LOG.get()
            }
            sfd = SavedLogData()
            sfd.process(jobid, self.__class__.__name__, json.dumps(toup))
        except Exception as e:
            print("EXCEPTION in [%s]: %s" % (name, str(e)))
            if "parse error" in str(e):
                line = str(e).split("(line ")
                try:
                    print("line=%s" % line)
                    linenum = line[1]
                    linenum = linenum.replace(")","")
                    print("linetoint=%s" % linenum)
                    linenum = int(linenum)
                    c = 0
                    print("AROUND:")
                    for n in myjs.split("\n"):
                        print("c=%s,linenum=%s" % (c,linenum))
                        if c-linenum > 0:
                            print(n)
                        c+=1
                except Exception as e:
                    print(str(e))
                    pass
            print(LOG.get())
            toup = {
                "name": name,
                "class": self.__class__.__name__,
                "log" : LOG.get()
            }
            sfd = SavedLogData()
            sfd.process(jobid, self.__class__.__name__, json.dumps(toup))
            toup = {
                "script": myjs,
                "name": name,
                "class": self.__class__.__name__,
                "error" : str(e),
            }
            sfd = SavedErrorData()
            sfd.process(jobid, self.__class__.__name__, json.dumps(toup))
            raise e
        return myret



