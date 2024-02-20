# coding=utf-8

import os
import unittest
import ipaddress
import json
import time
import sqlite3
import datetime
import copy
import base64
from ua_parser import user_agent_parser
from util import calcdate, encryption
from flask import request


con = None
if os.path.exists("bin/data/ipmapping.db"):
    F="bin/data/ipmapping.db"
    con = sqlite3.connect(F, check_same_thread=False)

class performance():
    __start = None
    __subsys = None
    __data__ = None

    def start(self, subsys):
        self.__subsys = subsys
        self.__start = datetime.datetime.now()
        j = {}
        try:
            if "Host-Info" in request.headers:
                j = json.loads(base64.b64decode(request.headers['Host-Info']))
            if con is not None and 'client_addr' in j:
                curs = con.cursor()
                g = int(ipaddress.ip_address(j['client_addr']))
                q = """select 
                        latitude, longitude, continent, 
                        country, stateprov, city 
                       from dbip_lookup where ? between ip_st_int and ip_en_int
                    """
                curs.execute(q, (g,))
                for n in curs:
                    j['location'] = {'lat': n[0], 'lon': n[1]}
                    j['continent'] = n[2]
                    j['country'] = n[3]
                    j['stateprov'] = n[4]
                    j['city'] = n[5]
                    break
            haveit = True
            return j
        except Exception as e:
            pass

    def process(self, cid, pid, *args, **kwargs):
        self.connect()
        data = args[0]
        self.save(cid, pid, data, "performance")
        return {"success": True}

    def setData(self, d):
        if d is not None:
            self.__data__ = base64.b64encode(json.dumps(d).encode('utf-8'))

    def stop(self):
        if self.__start is None:
            return 0
        ret = datetime.datetime.now() - self.__start
        ms = ret.total_seconds()
        current = calcdate.getTimestampNow()
        return ms
