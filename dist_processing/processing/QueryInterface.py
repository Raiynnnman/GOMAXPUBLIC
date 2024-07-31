# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from common.InvalidParameterException import InvalidParameterException
from processing.SubmitDataRequest import SubmitDataRequest
from sparks.SparkQuery import SparkQuery
from util.DBManager import DBManager 



class QueryInterface(SubmitDataRequest):
    
    def execute(self, *args, **kwargs):
        data = args[0]
        jobid = args[1]
        if isinstance(data, str):
            data = json.loads(data)
        if 'table' not in data:
            raise InvalidParameterException("'table' expected")
        if 'query' not in data:
            raise InvalidParameterException("'query' expected")
        if 'category' not in data:
            raise InvalidParameterException("'category' expected")
        if 'name' not in data:
            raise InvalidParameterException("'name' expected")
        resultid = ""
        if 'resultid' not in data:
            resultid = "%s-%s" % ("genericresult",calcdate.getTimestampUTC())
        else:
            resultid = data['resultid']
        calcdata = self.processQuery(data)
        self.insertResultData(data["name"], resultid, calcdata, jobid)
        ret = {}
        ret['data'] = {'resultid': resultid}
        ret['success'] = True
        return ret

    def processQuery(self, data):
        category = data['category']
        table = data['table']
        query = data['query']
        se = SparkQuery()
        calcdata = se.process(category, table, query)
        return calcdata

    def insertResultData(self, name, resultid, calcdata, jobid):
        mydb = DBManager().getConnection()
        curs = mydb.cursor(buffered=True)
        c = 1
        query = "insert into results (name, resultid,job_id) values (%s, %s,%s)"
        curs.execute(query, (name, resultid,jobid))
        lastrow = curs.lastrowid
        for x in calcdata:
            query = "insert into result_rows  (itemorder,resultid,data) values (%s,%s,%s)"
            curs.execute(query,(c,lastrow,json.dumps(x)))
            c += 1
        mydb.commit()
        # Close the pooled connection
        mydb.close()
