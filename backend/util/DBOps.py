# coding=utf-8

import os
import time
import unittest
from datetime import datetime, timedelta
from util.DBManager import DBManager
from mysql.connector.locales.eng import client_error
import json
import datetime
import decimal
from json import JSONEncoder
from util.Logging import Logging
from flask import request
from util import tzInfo

log = Logging()
TZ = tzInfo.getTZ()

class DBBase:
    __handle__ = None
    def __init__(self):
       self.__handle__ = DBManager().getConnection() 

class DateTimeEncoder(JSONEncoder):
        def default(self, obj):
            tz_off = 0
            try:
                if request and request.headers:
                    mytz = request.headers['TIMEZONE']
                    # print("HEAD: %s" % mytz)
                    tz_off = TZ[mytz]
            except Exception as e:
                print("TZERR: %s" % str(e))
            # print("tz_off: %s" % (tz_off))
            if isinstance(obj, (datetime.date, datetime.datetime)):
                nt = obj - timedelta(hours=tz_off)
                # print("oldtime: %s, newtime: %s" % (obj.isoformat(),nt.isoformat()))
                return nt.isoformat()
            if isinstance(obj, (decimal.Decimal,)):
                return float(obj)
            if isinstance(obj, (str,)):
                if obj.startswith('[') and obj.endswith("]"):
                    obj = json.loads(obj)
                return obj

class Query(DBBase):

    __LAST_INSERT_ID__ = 0

    def __init__(self):
        super().__init__()

    def LAST_INSERT_ID(self):
        return self.__LAST_INSERT_ID__

    def query(self,query,params=[]):
        if self.__handle__ is None:
            self.__handle__ = DBManager().getConnection()
        try:
            curs = self.__handle__.cursor(buffered=True,dictionary=True)
            curs.execute(query,params)
            rows = curs.fetchall()
            j = json.loads(json.dumps(rows,cls=DateTimeEncoder))
        except Exception as e:
            # log.error(query % params)
            raise e
        curs.close()
        return j

    def update(self,query,params=[]):
        if self.__handle__ is None:
            self.__handle__ = DBManager().getConnection()
        curs = self.__handle__.cursor(buffered=True)
        C = 0
        while C < 6:
            try:
                curs.execute(query,params)
                self.__LAST_INSERT_ID__ = curs.lastrowid
                C = 100
            except Exception as e:
                log.error("UPDATE Failed: %s. Attempt %s" % (str(e),C))
                log.error(query)
                if C > 4:
                    raise e
            if C < 5:
                time.sleep(1)
            C += 1
        curs.close()

    def commit(self):
        self.__handle__.commit()

    def __del__(self):
        try:
            self.__handle__.close()
        except Exception as e:
            print("WARNING: %s" % str(e))

class QueryTest(unittest.TestCase):

    def test_simple_query(self):
        q = Query()
        rows = q.query("select email from users")
        print(rows) # Test

    def test_simple_update(self):
        q = Query()
        q.update("drop table if exists fooish;")
        q.update("create table fooish(a int);")
        q.update("insert into fooish (a) values (1);")
        q.update("drop table fooish;")
