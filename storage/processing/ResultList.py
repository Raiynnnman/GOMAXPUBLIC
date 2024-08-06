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
from processing.QueryInterface import QueryInterface
from common.InvalidParameterException import InvalidParameterException
from util.DBManager import DBManager 


class ResultList(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = []
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        limit = self.getLimits(args)
        query = "select count(j.id) from datastorage_results j"
        total = 0
        db.execute(query)
        rows = db.fetchall()
        for n in rows:
            total=n[0]
        query = "select r.id, r.resultid, r.updated, r.job_id,j.job_id " \
                " from datastorage_results r,jobs j where j.id=r.job_id " \
                " order by updated desc limit %s offset %s" 
        db.execute(query, (limit['limit'], limit['offset']))
        rows = db.fetchall()
        for n in rows:
            data.append({ "id": n[0], "resultid": n[1], "updated":n[2], 
                "job_id":n[3], "jobname":n[4] })
        # Close the pooled connection
        mydb.close()
        return {'results': data, 'total':[{'total': total}]}





