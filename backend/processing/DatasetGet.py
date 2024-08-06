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
from common.InvalidParameterException import InvalidParameterException




class DatasetGet(SubmitDataRequest):
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        postdata = args[0] # [{"pagesize": 10, "page":1}] 
        if 'name' not in postdata:
            raise InvalidParameterException("name expeced")
        limit = self.getLimits(args) 
        myid = None
        if 'id' in postdata:
            myid = postdata['id']
        data = {}
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "select tblname,cols from dataset_registry where name=%s " 
        db.execute(query, (postdata['name'],))
        tblname = None
        cols = []
        rows = db.fetchall()
        for n in rows:
            tblname=n[0]
            cols=json.loads(n[1])
        if tblname is None:
            raise Exception("DATASET_NOT_FOUND: %s" % postdata['name'])

        query = "select count(*) from %s j" % tblname
        total = 0
        db.execute(query)
        rows = db.fetchall()
        for n in rows:
            total=n[0]
        ret = {
            "total":[{"total":total}],
            "data":[]
        }
        if myid is None:
            query = "select %s from %s "  % (",".join(cols),tblname) 
            query += " order by main_updated desc limit %s offset %s " 
            db.execute(query,(limit['limit'],limit['offset']))
            rows = db.fetchall()
        else:
            query = "select %s from %s "  % (",".join(cols),tblname) 
            query += " where objid = %s order by main_updated desc s limit %s offet %s"
            db.execute(query, (myid,limit['limit'],limit['offset']))
            rows = db.fetchall()
        for n in rows:
            row = {}
            c = 0
            for j in cols:
                t = j.replace("`","")
                row[t] = n[c]
                c+=1
            ret['data'].append(row)
        # Close the pooled connection
        mydb.close()
        return ret





