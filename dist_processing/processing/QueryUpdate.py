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


class QueryUpdate(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = args[0]
        if 'id' not in data:
            raise InvalidParameterException("ID EXPECTED")
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "update queries set name = %s, columns = %s, tables = %s, " \
            " updated = NOW(), groupby = %s, orderby=%s, whereclause=%s where id = %s" 
        db.execute(
            query, (data['name'], json.dumps(data['columns']), json.dumps(data['tables']),
                json.dumps(data['groupby']), json.dumps(data['orderby']), json.dumps(data['where']),
                data['id']
                )
        )
        mydb.commit()
        # Close the pooled connection
        mydb.close()
        return {'success': True}





