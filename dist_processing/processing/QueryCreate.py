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
from sparks.SparkQuery import SparkQuery
from processing.QueryInterface import QueryInterface
from util.DBManager import DBManager 


class QueryCreate(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = args[0]
        mydb = DBManager().getConnection()
        db = mydb.cursor()
        query = "insert into queries (name, columns, tables, groupby, orderby, whereclause) " \
            " values (%s,%s,%s,%s,%s,%s)"
        db.execute(
            query, (data['name'], json.dumps(data['columns']), json.dumps(data['tables']),
                json.dumps(data['groupby']), json.dumps(data['orderby']), json.dumps(data['where'])
                )
        )
        mydb.commit()
        # Close the pooled connection
        mydb.close()
        return {'success': True}





