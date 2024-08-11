# coding=utf-8

import os
import json
import unittest
import random
from util import encryption, S3Processing
from processing.run import app
from datetime import datetime
from flask import request, jsonify
from common.DataException import DataException
from processing.SubmitDataRequest import SubmitDataRequest
from processing.QueryInterface import QueryInterface
from sparks.SparkQuery import SparkQuery
from util import calcdate
from util.DBManager import DBManager 
from processing import AssembleQuery
from common.InvalidParameterException import InvalidParameterException
from util.Permissions import check_datascience
from util.DBOps import Query



class DatasetRun(SubmitDataRequest):

    def getType(self, v):
        if v is None:
            return "int", 0
        if v == "None":
            return "int", 0
        if v == "False":
            return "int", 0
        if v == "True":
            return "int", 1
        if isinstance(v, bool) and not v:
            return "int", 0
        if isinstance(v, bool) and v:
            return "int", 1
        if isinstance(v, float):
            return "double", v
        if isinstance(v, datetime):
            return "timestamp", v
        if isinstance(v, int):
            return "int", v
        if isinstance(v, dict):
            raise Exception("dict types not allowed")
        if isinstance(v, list):
            raise Exception("list types not allowed")
        return "varchar(255)", '"%s"' % v

    def handleFilters(self,type,filters,data):
        print("filters=%s" % filters)
        return data

    def etlToDatabase(self, name, data, db):
        if len(data) < 1:
            print("%s has no data to etl" % name)
            return
        cols = []
        print("data: %s" % data)
        ncols = data[0]
        # print("cols=%s" % ncols)
        if isinstance(ncols, dict):
            for n in ncols:
                cols.append(n)
        else:
            cols = ncols
        data.pop(0)
        tblname = "datastorage_dataset_%s_%s_%s" % (
            name.replace(" ",""),
            calcdate.getYearMonthDayHour().replace("-",""),
            random.randint(100, 500)
        )
        tblname = tblname.lower()
        # Get the first line so we can determine types
        types = data[0]
        if isinstance(types,str):
            types = json.loads(types)

        query = "select tblname,cols from datastorage_dataset_registry where name=%s " 
        rows = db.query(query,(name,))
        old_tblname = None
        for n in rows:
            old_tblname=n['tblname']

        query = """create table %s 
            (objid varchar(255), 
            main_updated TIMESTAMP not null default CURRENT_TIMESTAMP,
            dataset_name varchar(255))""" % tblname
        HAVECOLS = ["objid","main_updated","dataset_name"]
        db.update(query)
        c = 0
        if isinstance(types, list):
            while c < len(cols):
                j = cols[c]
                typ,v = self.getType(types[c])
                # print("c=%s,j=%s,v=%s,type=%s" % (c,j,v,typ))
                if j not in HAVECOLS:
                    query = "alter table %s add column (%s %s)" % (tblname,j,typ)
                    db.update(query)
                HAVECOLS.append(j)
                c += 1
        if isinstance(types, dict):
            for j in cols:
                typ,v = self.getType(types[j])
                # print("j=%s,v=%s,type=%s" % (j,v,typ))
                if j not in HAVECOLS:
                    query = "alter table %s add column (`%s` %s)" % (tblname,j,typ)
                    db.update(query)
                HAVECOLS.append(j)

        res_cols = []
        for n in cols:
            res_cols.append("`%s`" % n)
        # print(res_cols)
        mainquery = "insert into %s (%s) values " % (tblname, ",".join(res_cols))
        mainvalues = []
        for n in data:
            row = []
            c = 0
            if isinstance(types, dict):
                for g in cols:
                    if g not in n:
                        continue
                    typ,v=self.getType(n[g])
                    if g == "main_updated":
                        v = "FROM_UNIXTIME(%s)" % n[g]
                    row.append("%s" % v)
            if isinstance(types, list):
                while c < len(cols):
                    typ,v=self.getType(n[c])
                    if cols[c] == "main_updated":
                        v = "FROM_UNIXTIME(%s)" % n[c]
                    row.append("%s" % v)
                    c+=1
                    
            mainvalues.append("(%s)" % ",".join(row))
        # print("\n".join(mainvalues))
        db.update("%s %s" % (mainquery,",".join(mainvalues)))

        cols.insert(0, "main_updated")
        cols.insert(0, "objid")

        query = "replace into datastorage_dataset_registry (name,tblname,cols) values (%s,%s,%s)" 
        db.update(query,(name,tblname,json.dumps(res_cols)))
        # Keep this table live so that its servicable until its ready to be replaced
        if old_tblname is not None:
            old_tblname.lower().replace(" ", "_").strip()
            query = "drop table if exists %s" % old_tblname
            db.update(query)
        db.commit()
    
    def execute(self, *args, **kwargs):
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        print(params)
        resultid = None
        try:
            if 'id' not in params:
                raise InvalidParameterException("name expected")
            query = """select d.name,columns, tables, groupby, orderby,
                 whereclause,d.id from datastorage_dataset d, 
                 datastorage_queries q where 
                 d.query_id=q.id and d.id=%s 
                """
            rows = db.query(query, (params['id'],))
            mydsid = 0
            query = ""
            ds_name = ""
            myQueryData = {}
            if len(rows) < 1:
                raise InvalidParameterException("DATASET_NOT_FOUND: %s" % params['id'])
            for n in rows:
                myQueryData['columns'] = json.loads(n['columns'])
                myQueryData['tables'] = json.loads(n['tables'])
                myQueryData['groupby'] = json.loads(n['groupby'])
                myQueryData['orderby'] = json.loads(n['orderby'])
                myQueryData['where'] = json.loads(n['whereclause'])
                ds_name = n['name']
                mydsid = n['id']
            query = "select name, script from datastorage_dataset_list where dataset_id=%s"
            rows = db.query(query, (mydsid,))
            filts = []
            for n in rows:
                filts.append({"name":n['name'],"isActive":1,
                    "database":"dataset", "filters":[{"name":"", "script":n['script']}]
                })

            aq = AssembleQuery.AssembleQuery()
            newQuery = aq.assemble(myQueryData)
            ds_name = ds_name.replace(" ","-")
            resultid = "dataset-%s-%s" % (ds_name,calcdate.getTimestampUTC())
            toquery = { 
                "table": "default",
                "query": newQuery,
                "resultid": resultid,
                "category": ds_name
            } 
            qi = QueryInterface()
            #print("toquery=")
            #print(toquery)
            calcdata = qi.processQuery(toquery)
            myfinaldata = self.handleFilters("dataset",filts,calcdata)
            self.etlToDatabase(ds_name,myfinaldata,db)
        except Exception as e:
            raise InvalidParameterException(str(e))
        return {"resultid": resultid}




