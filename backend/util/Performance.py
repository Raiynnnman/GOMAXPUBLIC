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
from util.DBOps import Query

class performance():
    __start = None
    __subsys = None
    __data__ = {}
    __status__ = 0
    __user_id__ = None
    __metadata__ = None

    def setUserID(self,c):
        self.__user_id__ = c

    def setData(self,c):
        self.__metadata__ = c

    def start(self, subsys):
        self.__subsys = subsys
        self.__start = datetime.datetime.now()
        db = Query()
        j = {
            'lat':0,
            'lon':0,
            'ms': 0,
            'stateprov':'',
            'ip':'',
            'city':'',
            'country':'',
            'request':'',
            'classname': subsys,
            'continent':''
        }
        self.__data__ = j
        try:
            ip = None
            if "X-Forwarded-For" in request.headers:
                ip = request.headers['X-Forwarded-For']
                j['ip'] = ip
            if ip is not None:
                g = int(ipaddress.ip_address(ip))
                print("g=%s" % g)
                q = """select 
                        latitude, longitude, continent, 
                        country, stateprov, city 
                       from ip_lookup where %s between ip_st_int and ip_en_int
                    """
                o = db.query(q,(g,))
                print("iplat: %s (%s)" % (o,g))
                for n in o:
                    j['lat'] = n[0] 
                    j['lon'] = n[1]
                    j['continent'] = n[2]
                    j['country'] = n[3]
                    j['stateprov'] = n[4]
                    j['city'] = n[5]
                    break
                self.__data__ = j
            return j
        except Exception as e:
            print("PERFORMANCE_ERROR:%s" % str(e))

    def status(self,s):
        self.__status__ = s

    def save(self):
        db = Query()
        j = self.__data__
        db.update("""
            insert into performance 
                (classname,lat,lon,country,state,city,ms,ip,continent,user_id,data) 
                values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,(j['classname'],j['lat'],j['lon'],j['country'],
                 j['stateprov'],j['city'],j['ms'],
                 j['ip'],j['continent'],self.__user_id__,
                json.dumps(self.__metadata__)
                )
        )
        db.commit()

    def stop(self):
        if self.__start is None:
            return 0
        ret = datetime.datetime.now() - self.__start
        ms = float("%s.%s" % (ret.seconds,ret.microseconds))
        current = calcdate.getTimestampNow()
        self.__data__['ms'] = ms
        return ms
