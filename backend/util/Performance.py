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


con = None
if os.path.exists("./bin/data/ipmapping.db"):
    F="./bin/data/ipmapping.db"
    con = sqlite3.connect(F, check_same_thread=False)

class performance():
    __start = None
    __subsys = None
    __data__ = {}
    __status__ = 0

    def start(self, subsys):
        global con
        self.__subsys = subsys
        self.__start = datetime.datetime.now()
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
            if con is not None and ip is not None:
                curs = con.cursor()
                g = int(ipaddress.ip_address(ip))
                q = """select 
                        latitude, longitude, continent, 
                        country, stateprov, city 
                       from dbip_lookup where ? between ip_st_int and ip_en_int
                    """
                curs.execute(q, (g,))
                for n in curs:
                    j['lat'] = n[0] 
                    j['lon'] = n[1]
                    j['continent'] = n[2]
                    j['country'] = n[3]
                    j['stateprov'] = n[4]
                    j['city'] = n[5]
                    break
            else:
                # print("no db")
                pass
            self.__data__ = j
            return j
        except Exception as e:
            print(str(e))

    def status(self,s):
        self.__status__ = s

    def save(self):
        db = Query()
        j = self.__data__
        db.update("""
            insert into performance 
                (classname,lat,lon,country,state,city,ms,ip,continent) 
                values (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,(j['classname'],j['lat'],j['lon'],j['country'],
                 j['stateprov'],j['city'],j['ms'],
                 j['ip'],j['continent']
                )
        )
        db.commit()
        # print(request.headers)
        # print(self.__data__)

    def setData(self, d):
        if d is not None:
            self.__data__ = base64.b64encode(json.dumps(d).encode('utf-8'))

    def stop(self):
        if self.__start is None:
            return 0
        ret = datetime.datetime.now() - self.__start
        ms = ret.total_seconds()
        current = calcdate.getTimestampNow()
        self.__data__['ms'] = ms
        return ms
