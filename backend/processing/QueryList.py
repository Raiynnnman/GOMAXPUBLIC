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
from util.Permissions import check_datascience
from util.DBOps import Query


class QueryList(SubmitDataRequest):

    
    def isDeferred(self):
        return False

    @check_datascience
    def execute(self, *args, **kwargs):
        data = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        limit = 10
        offset = 0
        if 'limit' in params:
            limit = params['limit']
        if 'offset' in params:
            offset = params['offset']
        query = "select count(j.id) as cnt from datastorage_queries j"
        total = 0
        rows = db.query(query)
        total=rows[0]['cnt']
        query = "select q.id, q.name, q.columns,q.tables,q.whereclause," \
            " q.groupby, q.orderby, q.updated, q.rawquery from " \
            " datastorage_queries q order by updated desc limit %s offset %s" 
        rows = db.query(query, (limit, limit*offset))
        for n in rows:
            print(n)
            data.append({ 
                "id": n['id'], "name": n['name'], "columns":json.loads(n['columns']), 
                "tables": json.loads(n['tables']), "where":json.loads(n['whereclause']), 
                "groupby": json.loads(n['groupby']), "orderby": json.loads(n['orderby']), 
                "updated":n['updated'], "rawquery": n['rawquery'] 
            })
        return {'queries': data, 'total': total}





