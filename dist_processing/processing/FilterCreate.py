# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from util.DBManager import DBManager 


class FilterCreate(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = args[0]
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "insert into filters (name,tblname) " \
            " values (%s,%s)"
        db.execute(
            query, (data['name'], data['database'])
        )
        lastrow = db.lastrowid
        for n in data['filters']:
            query = "insert into filter_list (filters_id,name,script) " \
                " values (%s,%s,%s)"
            db.execute(
                query, (lastrow, data['name'], n['script'])
            )

        mydb.commit()
        # Close the pooled connection
        mydb.close()
        return {'success': True}





