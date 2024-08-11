# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from sparks.SparkQuery import SparkQuery
from util.DBManager import DBManager 
from util.Permissions import check_datascience
from util.DBOps import Query


class DatasetList(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        limit = 10
        offset = 0
        if 'limit' in params:
            limit = params['limit']
        if 'offset' in params:
            offset = params['offset']
        query = "select count(j.id) as cnt from datastorage_dataset j"
        total = 0
        rows = db.query(query)
        total=rows[0]['cnt']
        query = """
         select 
            dd.id, dd.name, 
            json_array(
                json_object(
                    'id',ddl.id, 'name',ddl.name, 'script',ddl.script
                )
            ) as scripts,
            dd.query_id,  
            dd.updated, 
            dd.is_active,
            dq.name 
            from 
                datastorage_dataset dd
            left outer join 
                datastorage_dataset_list ddl on dd.id = ddl.dataset_id
            left outer join 
                datastorage_queries dq on dd.query_id = dq.id
            group by 
                dd.id
            order by updated desc limit %s offset %s
        """
        ret = []
        rows = db.query(query, (limit, limit*offset))
        for x in rows:
            x['scripts'] = json.loads(x['scripts'])
            ret.append(x)
        return {'dataset': ret, 'total':total}





