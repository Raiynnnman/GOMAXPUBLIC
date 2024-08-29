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

__CACHE__ = {}

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
        __s = 0
        try:
            __s = datetime.datetime.now()
            ip = None
            if "X-Forwarded-For" in request.headers:
                ip = request.headers['X-Forwarded-For']
                j['ip'] = ip
            if ip is not None:
                print("ip is not none")
                o = []
                g = int(ipaddress.ip_address(ip))
                print("g=%s" % g)
                if g in __CACHE__:
                    print("PERF_CACHE_HIT")
                    o = [__CACHE__[g]]
                else:
                    #print("g=%s" % g)
                    print("PERF_CACHE_MISS")
                    q = """select 
                            latitude, longitude, continent, 
                            country, stateprov, city 
                           from ip_lookup where %s between ip_st_int and ip_en_int
                            limit 1
                        """
                    o = db.query(q,(g,))
                    if len(o) > 0:
                        __CACHE__[g] = o[0]
                    else:
                        __CACHE__[g] = []
                    #print("iplat: %s (%s)" % (o,g))
                for n in o:
                    j['lat'] = n['latitude']
                    j['lon'] = n['longitude']
                    j['continent'] = n['continent']
                    j['country'] = n['country']
                    j['stateprov'] = n['stateprov']
                    j['city'] = n['city']
                    break
                self.__data__ = j
            return j
        except Exception as e:
            print("PERFORMANCE_ERROR:%s" % str(e))
        finally:
            __p = datetime.datetime.now() - __s
            __ms = float("%s.%s" % (__p.seconds,__p.microseconds))
            print("PERF_LOOKUP: %s: %2.6fs" % (self.__subsys,__ms))

    def status(self,s):
        self.__status__ = s

    def save(self):
        db = Query()
        j = self.__data__
        db.update("""
            insert into performance 
                (classname,lat,lon,country,state,city,ms,ip,continent,user_id,data,data_sha) 
                values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,(j['classname'],j['lat'],j['lon'],j['country'],
                 j['stateprov'],j['city'],j['ms'],
                 j['ip'],j['continent'],self.__user_id__,
                json.dumps(self.__metadata__),
                encryption.getSHA256(json.dumps(self.__metadata__,sort_keys=True))
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
