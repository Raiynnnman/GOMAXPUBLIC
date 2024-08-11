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
from util.DBManager import DBManager 
from util.Permissions import check_datascience
from util.DBOps import Query


class MetadataGet(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    @check_datascience
    def execute(self, *args, **kwargs):
        data = {}
        db = Query()
        data['operations'] = [
                {
                "id": "o-1",
                "name": "VALUE",
                },
                {
                "id": "o-2",
                "name": "SUM",
                },
                {
                "id": "o-3",
                "name": "AVG",
                },
                {
                "id": "o-4",
                "name": "MAX",
                },
                {
                "id": "o-5",
                "name": "MIN",
                },
                {
                "id": "o-6",
                "name": "STDDEV",
                },
                {
                "id": "o-7",
                "name": "VARIANCE",
                }
            ]
        data['filters'] = []
        query = """
            select t.id, t.name, c.name as column_name, c.id, c.datatypes 
            from datastorage_tables t,datastorage_columns c where c.datastorage_tables_id=t.id 
            and t.name not in ('default') order by t.name,c.name
            """
        rows = db.query(query)
        thistable = {}
        data['tables'] = []
        data['table_data'] = {}
        for row in rows:
            i = row['id']
            n = row['name']
            if n not in data['tables']:
                data['tables'].append(n)
            if n not in data['table_data']:
                data['table_data'][n] = { 
                    "id": "%s-%s" % (n,i),
                    "name": n,
                    "alias": self.getAlias(row['name']),
                    "columns": []
                } 
            data['table_data'][n]["columns"].append({
                "id":"id-%s-%s" % (self.getAlias(row['name']),row['column_name']),
                "alias": self.getAlias(row['name']),
                "name":"%s.%s" % (n,row['column_name']),
                "table":n,
                "type":row['datatypes']
            })
        return data

    def getAlias(self, tbl):
        c = 0
        ret = ''
        while c < len(tbl):
            if tbl[c] == "_":
                c+=3
                continue
            ret += tbl[c]
            c += 2
        return ret


