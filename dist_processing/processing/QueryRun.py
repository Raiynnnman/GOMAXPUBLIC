# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from common.InvalidParameterException import InvalidParameterException
from processing.QueryInterface import QueryInterface
from sparks.SparkQuery import SparkQuery
from util import calcdate
from processing import AssembleQuery
from util.DBManager import DBManager 


class QueryRun(SubmitDataRequest):
    
    def execute(self, *args, **kwargs):
        data= args[0] # [{"pagesize": 10, "page":1}] 
        jobid=args[1]
        if 'id' not in data:
            raise InvalidParameterException("id expected")
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "select q.name,columns, tables, groupby, orderby," \
            " whereclause from queries q where id=%s" 
        db.execute(query, (data['id'],))
        rows = db.fetchall()
        query = ""
        name = ""
        myQueryData = {}
        for n in rows:
            myQueryData['columns'] = json.loads(n[1])
            myQueryData['tables'] = json.loads(n[2])
            myQueryData['groupby'] = json.loads(n[3])
            myQueryData['orderby'] = json.loads(n[4])
            myQueryData['where'] = json.loads(n[5])
            name = n[0]
        aq = AssembleQuery.AssembleQuery()
        newQuery = aq.assemble(myQueryData)
        name = name.replace(" ","-")
        resultid = "query-%s-%s" % (name,calcdate.getTimestampUTC())
        toquery = { 
            "table": "default",
            "query": newQuery,
            "name": name,
            "resultid": resultid,
            "category": name
        } 
        qi = QueryInterface()
        qi.process(toquery,jobid)
        # Close the pooled connection
        mydb.close()
        return {"resultid": resultid}




