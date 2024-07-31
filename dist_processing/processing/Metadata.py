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

class Metadata(SubmitDataRequest):
    
    def execute(self, *args, **kwargs):
        mydb = DBManager().getConnection()
        seTables = SparkQuery()
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
        curs = mydb.cursor(buffered=True)
        # NOTE: This might require more complicated mechanism considering hosting implications
        curs.execute("delete from tables")
        curs.execute("delete from columns")
        for x in finalMeta:
            query = "insert into tables (name) values (%s)"
            curs.execute(query, (x,))
            tblid = curs.lastrowid
            for n in finalMeta[x]:
                query = "insert into columns (tables_id,name,datatypes) values (%s, %s, %s)"            
                curs.execute(query, (tblid,n['name'],n['type']))
        mydb.commit()
        # Close the pooled connection
        mydb.close()
        return {'success': True}





