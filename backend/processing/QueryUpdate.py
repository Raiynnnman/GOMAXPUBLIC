# coding=utf-8

import os
import json
import unittest
from common.InvalidParameterException import InvalidParameterException
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from sparks.SparkQuery import SparkQuery
from processing.QueryInterface import QueryInterface
from util.DBManager import DBManager 
from util.Permissions import check_datascience
from util.DBOps import Query


class QueryUpdate(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    @check_datascience
    def execute(self, *args, **kwargs):
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        myid = None
        if 'id' in params:
            myid = params['myid']
        db = Query()
        if myid is not None:
            query = "update datastorage_queries set name = %s, columns = %s, tables = %s, " \
                " updated = NOW(), groupby = %s, orderby=%s, whereclause=%s where id = %s" 
            db.execute(
                query, (params['name'], json.dumps(params['columns']), json.dumps(params['tables']),
                    json.dumps(params['groupby']), json.dumps(params['orderby']), json.dumps(params['where']),
                    params['id']
                    )
            )
        else:
            query = "insert into datastorage_queries (name, columns, tables, groupby, orderby, whereclause) " \
                " values (%s,%s,%s,%s,%s,%s)"
            db.execute(
                query, (params['name'], json.dumps(params['columns']), json.dumps(params['tables']),
                    json.dumps(params['groupby']), json.dumps(params['orderby']), json.dumps(params['where'])
                    )
            )
        db.commit()
        return {'success': True}



