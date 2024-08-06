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


class DatasetUpdate(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = args[0]
        if 'id' not in data:
            raise Exception("ID EXPECTED")
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "update dataset set name = %s, query_id = %s," \
            " updated = NOW() " \
            " where id = %s " 
        db.execute(
            query, (data['name'], data['query_id'], data['id'])
        )
        query = "delete from dataset_list where dataset_id = %s" 
        db.execute(query, (data['id'],))
        for n in data['datasets']:
            query = "insert into dataset_list (dataset_id,name,script) " \
                " values (%s,%s,%s)"
            db.execute(
                query, (data['id'], n['name'], n['script'])
            )
        mydb.commit()
        # Close the pooled connection
        mydb.close()
        return {'success': True}





