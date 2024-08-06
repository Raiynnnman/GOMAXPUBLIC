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


class FilterList(SubmitDataRequest):

    def __init__(self):
        super().__init__()
    
    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        data = {}
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        limit = self.getLimits(args) 
        query = "select count(j.id) from filters j"
        total = 0
        db.execute(query)
        rows = db.fetchall()
        for n in rows:
            total=n[0]
        query = "select f.id, f.name, fl.id, fl.name, fl.script, f.tblname, " \
            " f.updated, f.is_active " \
            " from filters f,filter_list fl where fl.filters_id=f.id" \
            " order by updated desc limit %s offset %s"

        db.execute(query, (limit['limit'], limit['offset']))
        rows = db.fetchall()
        for n in rows:
            if n[1] not in data:
                data[n[1]] = { 
                    'id': n[0],
                    'name': n[1],
                    'isActive': n[7],
                    'updated': n[6],
                    'database': n[5],
                    'filters': []
                }
            data[n[1]]['filters'].append({'id': n[2], 'name': n[3], 'script': n[4]})
        ret = []
        for n in data:
            ret.append(data[n])
        # Close the pooled connection
        mydb.close()
        return {'filters': ret, 'total':[{'total': total}]}





