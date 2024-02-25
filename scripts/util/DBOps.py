# coding=utf-8

import os
import time
import unittest
from util.DBManager import DBManager
from mysql.connector.locales.en import client_error
import json
import datetime
import decimal
from json import JSONEncoder
from util.Logging import Logging

log = Logging()

class DBBase:
    __handle__ = None
    def __init__(self):
       self.__handle__ = DBManager().getConnection() 

class DateTimeEncoder(JSONEncoder):
        def default(self, obj):
            if isinstance(obj, (datetime.date, datetime.datetime)):
                return obj.isoformat()
            if isinstance(obj, (decimal.Decimal,)):
                return float(obj)
            if isinstance(obj, (str,)):
                if obj.startswith('[') and obj.endswith("]"):
                    obj = json.loads(obj)
                return obj

class Query(DBBase):

    def __init__(self):
        super().__init__()

    def query(self,query,params=[]):
        if self.__handle__ is None:
            self.__handle__ = DBManager().getConnection()
        curs = self.__handle__.cursor(buffered=True,dictionary=True)
        curs.execute(query,params)
        rows = curs.fetchall()
        j = json.loads(json.dumps(rows,cls=DateTimeEncoder))
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
                C = 100
            except Exception as e:
                log.error("UPDATE Failed: %s. Attempt %s" % (str(e),C))
                if C > 4:
                    raise e
            if C < 5:
                time.sleep(1)
            C += 1
        curs.close()

    def commit(self):
        self.__handle__.commit()

    def __del__(self):
        self.__handle__.close()

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
