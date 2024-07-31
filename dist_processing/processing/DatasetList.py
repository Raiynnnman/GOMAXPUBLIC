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



class DatasetList(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = {}
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        limit = self.getLimits(args) 
        query = "select count(j.id) from dataset j"
        total = 0
        db.execute(query)
        rows = db.fetchall()
        for n in rows:
            total=n[0]
        query = """
         select 
            dataset.id, dataset.name, dataset_list.id, dataset_list.name, 
            dataset_list.script, dataset.query_id,  dataset.updated, dataset.is_active,
            queries.name 
            from 
                dataset
            left outer join 
                dataset_list on dataset.id = dataset_list.dataset_id
            left outer join 
                queries on dataset.query_id = queries.id
            order by updated desc limit %s offset %s
        """

        db.execute(query, (limit['limit'], limit['offset']))
        rows = db.fetchall()
        for n in rows:
            if n[1] not in data:
                data[n[1]] = { 
                    'id': n[0],
                    'name': n[1],
                    'isActive': n[7],
                    'updated': n[6],
                    'queryname': n[8],
                    'query_id': n[5],
                    'dataset': []
                }
            data[n[1]]['dataset'].append({'id': n[2], 'name': n[3], 'script': n[4]})
        ret = []
        for n in data:
            ret.append(data[n])
        # Close the pooled connection
        mydb.close()
        return {'dataset': ret, 'total':[{'total': total}]}





