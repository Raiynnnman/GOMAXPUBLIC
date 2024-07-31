# coding=utf-8

import os
import json
import unittest
from util import encryption, S3Processing
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from processing.FilterList import FilterList
from sparks.SparkQuery import SparkQuery
from common import settings

bucket ="event-image-library"
config = settings.config()
config.read("settings.cfg")

class ExportData(SubmitDataRequest):
    
    def execute(self, *args, **kwargs):
        mydata = args[0]
        jobid = args[1]
        ret = {}
        request_id = encryption.getSHA256()
        sq = SparkQuery()
        t = sq.process("query","query","show tables")
        for n in t:
            tbl = n[1]
            if tbl == "tableName":
                continue
            if tbl == "default":
                continue
            COLS=[]
            cols = sq.process("query","query","desc %s" % tbl)
            for g in cols:
                v = str(g[0])
                COLS.append(v)
            query = ""
            if "sb_player_id" in COLS:
                query = "select * from athletes ath,%s %s " \
                    " where " \
                    " ath.objid=%s.sb_player_id " % (tbl,tbl[:3],tbl[:3])
            else:
                query = "select * from %s" % tbl
            # print("query=%s" % query)
            df = sq.process("query","query",query)
            path = "data_exports/%s/%s" % (jobid,"%s.json" % tbl)
            S3Processing.uploadS3ItemToBucket(
                config.getKey("request_bucket_access_key"),
                config.getKey("request_bucket_access_secret"),
                bucket,
                path,
                json.dumps(df,indent=2)
            )

        ret["request_id"] = request_id
        ret["success"] = True
        return ret



