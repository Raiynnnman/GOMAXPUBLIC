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


class MetadataGet(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = []
        data.append(
            {
            "name": "operations", 
            "columns":[
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
            }
        )
        data.append(
            {
            "name": "filters", 
            "columns":[
                {
                "id": "f-1",
                "name": "facebook",
                },
                {
                "id": "f-2",
                "name": "instagram",
                },
                {
                "id": "f-3",
                "name": "twitter",
                },
                {
                "id": "f-4",
                "name": "tiktok",
                },
                {
                "id": "f-5",
                "name": "athlete",
                },
                {
                "id": "f-6",
                "name": "tournament",
                },
                {
                "id": "f-7",
                "name": "semrush",
                }
            ]
            }
        )
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "select t.id, t.name, c.name, c.id, c.datatypes " \
                " from tables t,columns c where c.tables_id=t.id " \
                " and t.name not in ('default') order by t.name,c.name" 
        db.execute(query)
        rows = db.fetchall()
        thistable = {}
        for row in rows:
            i = row[0]
            n = row[1]
            if n not in thistable:
                thistable[n] = { 
                    "id": "%s-%s" % (n,i),
                    "name": row[1],
                    "alias": self.getAlias(row[1]),
                    "columns": []
                } 
            thistable[n]["columns"].append({
                "id":"id-%s-%s" % (self.getAlias(row[1]),row[2]),
                "alias": self.getAlias(row[1]),
                "name":row[2],
                "table":row[1],
                "type":row[4]
            })

        for n in thistable:
            data.append(thistable[n])
        
        # Close the pooled connection
        mydb.close()
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


