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

class DataScienceMetadataRefresh(SubmitDataRequest):
    
    @check_datascience
    def execute(self, *args, **kwargs):
        seTables = SparkQuery()
        db = Query()
        table = "default"
        query = "show tables"
        category = "metadata"
        finalMeta = {}
        tables = seTables.process(category, table, query)
        if isinstance(tables,str):
            tables = json.loads(tables)
        for tbl in tables:
            if tbl[0] == "namespace":
                continue
            table = tbl[1]
            finalMeta[table] = []
            # This is a placeholder table, dont register it
            if table == "default":
                continue
            query = "describe table %s" % table
            seColumns = SparkQuery()
            columns = seTables.process(category, table, query)
            if isinstance(columns,str):
                columns = json.loads(columns)
            for col in columns:
                if col[0] == "col_name":
                    continue
                mycol = col['col_name']
                if mycol.startswith("#") or "partitioned" in mycol.lower():
                    continue
                if " " in mycol or len(mycol) < 2:
                    continue
                mytype = col['data_type']
                finalMeta[table].append({"name": mycol,"type":mytype})
        for x in finalMeta:
            o = db.query("""
                select id from datastorage_tables 
                where name = %s
                """,(x,)
            )
            tblid = 0
            if len(o) > 0:
                tblid = o[0]['id']
                db.update("delete from datastorage_columns where id = %s",(tblid,))
            else:
                query = "insert into datastorage_tables (name) values (%s)"
                db.update(query, (x,))
                tblid = db.LAST_INSERT_ID()
            for n in finalMeta[x]:
                query = "insert into datastorage_columns (datastorage_tables_id,name,datatypes) values (%s, %s, %s)"            
                db.update(query, (tblid,n['name'],n['type']))
        db.commit()
        return {'success': True}





