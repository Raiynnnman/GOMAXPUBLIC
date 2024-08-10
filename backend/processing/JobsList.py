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

class JobsList(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    @check_datascience
    def execute(self, *args, **kwargs):
        data = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        limit = 10
        offset = 0
        if 'limit' in params:
            limit = params['limit']
        if 'offset' in params:
            offset = params['offset']
        query = "select count(j.id) as cnt from jobs j where is_storage_job = 1"
        total = 0
        rows = db.query(query)
        total=rows[0]['cnt']
        query = "select jobs.id, jobs.job_id, status.value as status, jobs.updated, jobs.class_name " \
            " from jobs,status " \
            " where " \
            " status.id=jobs.curr_status " \
            " and jobs.id not in (%s) " \
            " and jobs.is_storage_job = 1 " \
            " order by jobs.updated desc limit %s offset %s" 
        rows = db.query(query, (job, limit, limit * offset))
        ret = []
        for n in rows:
            joblog = []
            errlog = []
            query = "select data from joblog where job_id = %s"
            n['logs'] = db.query(query,(n['id'],))
            query = "select data from errorlog where job_id = %s"
            n['errors'] = db.query(query,(n['id'],))
            ret.append(n)
        return {'jobs': ret, 'total': total}





