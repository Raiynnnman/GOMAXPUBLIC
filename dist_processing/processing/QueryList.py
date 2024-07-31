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
from processing.QueryInterface import QueryInterface
from util.DBManager import DBManager 


class QueryList(SubmitDataRequest):

    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = []
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        limit = self.getLimits(args)
        query = "select count(j.id) from queries j"
        total = 0
        db.execute(query)
        rows = db.fetchall()

        for n in rows:
            total=n[0]
        if 'all' in data:
            data['limit'] = total
        query = "select q.id, q.name, q.columns,q.tables,q.whereclause," \
            " q.groupby, q.orderby, q.updated, q.rawquery from " \
            " queries q order by updated desc limit %s offset %s" 
        if 'all' in data:
            query = "select q.id, q.name from queries " \
                " queries q order by name" 
        db.execute(query, (limit['limit'], limit['offset']))
        rows = db.fetchall()
        for n in rows:
            data.append({ 
                "id": n[0], "name": n[1], "columns":json.loads(n[2]), 
                "tables": json.loads(n[3]), "where":json.loads(n[4]), "groupby": json.loads(n[5]),
                "orderby": json.loads(n[6]), "updated":n[7], "rawquery": n[8] 
            })
        # Close the pooled connection
        mydb.close()
        return {'queries': data, 'total':[{'total': total}]}





