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



class JobsList(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        jobid = args[1]
        data = []
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        limit = self.getLimits(args)  
        query = "select count(j.id) from jobs j where is_active=1"
        total = 0
        db.execute(query)
        rows = db.fetchall()
        for n in rows:
            total=n[0]
        query = "select jobs.id, jobs.job_id, status.value, jobs.updated " \
            " from jobs,status " \
            " where " \
            " status.id=jobs.curr_status " \
            " and jobs.id not in (%s) and jobs.is_active = 1 " \
            " order by jobs.updated desc limit %s offset %s" 
        db.execute(query, (jobid, limit['limit'], limit['offset']))
        rows = db.fetchall()
        idlist = []
        toparse = {}
        for n in rows:
            idlist.append(n[0])
            toparse[n[0]] = { "id": n[0], "job": n[1], 
                "status":n[2], "updated":n[3],
                "joblog":[], "errorlog":[]
            }
        myret = toparse
        for n in toparse:
            joblog = []
            errlog = []
            query = "select data from joblog where job_id = %s"
            rows = db.fetchall()
            for t in rows:
                joblog.append(t[0])
            myret[n]["joblog"] = joblog
            query = "select data from errorlog where job_id = %s"
            rows = db.fetchall()
            for t in rows:
                errlog.append(t[0])
            myret[n]["errorlog"] = errlog
        for n in myret:
            data.append(myret[n])
        # Close the pooled connection
        mydb.close()
        return {'jobs': data, 'total':[{'total': total}]}





