# coding=utf-8

import os
import csv
import base64
import json
import io
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify, Response
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from common.InvalidParameterException import InvalidParameterException
from sparks.SparkQuery import SparkQuery
from processing.QueryInterface import QueryInterface
from util.DBManager import DBManager 


class ResultGet(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def generateCSV(self, data):
        stringbuf = io.StringIO()
        w = csv.writer(stringbuf)

        # write header
        #w.writerow(('action', 'timestamp'))
        #yield data.getvalue()
        #data.seek(0)
        #data.truncate(0)

        # write each log item
        for item in data:
            row = []
            for col in item:
                row.append(col)
            w.writerow(row)
        return stringbuf

    def execute(self, *args, **kwargs):
        mydata = args[0] # [{"pagesize": 10, "page":1}] 
        if 'id' not in mydata:
            raise InvalidParameterException("'id' expected")
        myid = mydata['id']
        ret = {}
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "select r.resultid,rr.data from results r,result_rows rr" \
            "  where r.id = %s and r.id=rr.resultid order by itemorder"
        db.execute(query, (myid,))
        rows = db.fetchall()
        data = []
        for n in rows:
            resultid = n[0]
            data.append(json.loads(n[1]))
        buf = self.generateCSV(data)
        ret['contents'] = base64.b64encode(buf.getvalue().encode('utf-8')).decode('utf-8')
        ret['type'] = "text/csv"
        ret['resultid'] = resultid
        result = resultid.replace(":","-")

        # response = Response(self.generateCSV(data), mimetype='text/csv')
        # response.headers.set("Content-Disposition", "attachment", filename=resultid)
        # Close the pooled connection
        mydb.close()
        return ret





