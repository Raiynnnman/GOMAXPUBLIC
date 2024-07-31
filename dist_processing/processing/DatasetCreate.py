# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from common import settings, version
from util.DBManager import DBManager 

class DatasetCreate(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = args[0]
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "insert into dataset (name,query_id) " \
            " values (%s,%s)"
        db.execute(
            query, (data['name'], data['query_id'])
        )
        lastrow = db.lastrowid
        for n in data['datasets']:
            query = "insert into dataset_list (dataset_id,name,script) " \
                " values (%s,%s,%s)"
            db.execute(
                query, (lastrow, n['name'], n['script'])
            )

        mydb.commit()
        # Close the pooled connection
        mydb.close()
        return {'success': True}





