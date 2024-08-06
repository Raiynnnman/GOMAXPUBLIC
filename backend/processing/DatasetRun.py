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
            # return "TIMESTAMP(6)", v
            return "int", v
        if isinstance(v, int):
            return "int", v
        if isinstance(v, dict):
            raise Exception("dict types not allowed")
        if isinstance(v, list):
            raise Exception("list types not allowed")
        return "varchar(255)", '"%s"' % v

    def etlToDatabase(self, name, data, mydb):
        if len(data) < 1:
            print("%s has no data to etl" % name)
            return
        cols = []
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

        db = mydb.cursor(buffered=True)

        query = "select tblname,cols from datastorage_dataset_registry where name=%s " 
        db.execute(query,(name,))
        old_tblname = None
        rows = db.fetchall()
        for n in rows:
            old_tblname=n[0]

        query = """create table %s 
            (objid varchar(255), 
            main_updated TIMESTAMP not null default CURRENT_TIMESTAMP,
            dataset_name varchar(255))""" % tblname
        HAVECOLS = ["objid","main_updated","dataset_name"]
        db.execute(query)
        c = 0
        if isinstance(types, list):
            while c < len(cols):
                j = cols[c]
                typ,v = self.getType(types[c])
                # print("c=%s,j=%s,v=%s,type=%s" % (c,j,v,typ))
                if j not in HAVECOLS:
                    query = "alter table %s add column (%s %s)" % (tblname,j,typ)
                    db.execute(query)
                HAVECOLS.append(j)
                c += 1
        if isinstance(types, dict):
            for j in cols:
                typ,v = self.getType(types[j])
                # print("j=%s,v=%s,type=%s" % (j,v,typ))
                if j not in HAVECOLS:
                    query = "alter table %s add column (`%s` %s)" % (tblname,j,typ)
                    db.execute(query)
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
        db.execute("%s %s" % (mainquery,",".join(mainvalues)))
        mydb.commit()

        cols.insert(0, "main_updated")
        cols.insert(0, "objid")
                

        query = "replace into datastorage_dataset_registry (name,tblname,cols) values (%s,%s,%s)" 
        db.execute(query,(name,tblname,json.dumps(res_cols)))
        mydb.commit()
        # Keep this table live so that its servicable until its ready to be replaced
        if old_tblname is not None:
            old_tblname.lower().replace(" ", "_").strip()
            query = "drop table if exists %s" % old_tblname
            db.execute(query)
            mydb.commit()
    
    def execute(self, *args, **kwargs):
        data= args[0] # [{"pagesize": 10, "page":1}] 
        jobid=args[1]
        if 'name' not in data:
            raise InvalidParameterException("name expected")
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = """select d.name,columns, tables, groupby, orderby,
             whereclause,d.id from datastorage_dataset d, 
             datastorage_queries q where 
             d.query_id=q.id and q.name=%s 
            """
        db.execute(query, (data['name'],))
        rows = db.fetchall()
        mydsid = 0
        query = ""
        name = ""
        myQueryData = {}
        for n in rows:
            myQueryData['columns'] = json.loads(n[1])
            myQueryData['tables'] = json.loads(n[2])
            myQueryData['groupby'] = json.loads(n[3])
            myQueryData['orderby'] = json.loads(n[4])
            myQueryData['where'] = json.loads(n[5])
            name = n[0]
            mydsid = n[6]
        if mydsid == 0:
            raise InvalidParameterException("DATASET_NOT_FOUND: %s" % data)
        query = "select name, script from datastorage_dataset_list where dataset_id=%s"
        db.execute(query, (mydsid,))
        rows = db.fetchall()
        filts = []
        for n in rows:
            filts.append({"name":n[0],"isActive":1,
                "database":"dataset", "filters":[{"name":"", "script":n[1]}]
            })

        aq = AssembleQuery.AssembleQuery()
        newQuery = aq.assemble(myQueryData)
        name = name.replace(" ","-")
        resultid = "dataset-%s-%s" % (name,calcdate.getTimestampUTC())
        toquery = { 
            "table": "default",
            "query": newQuery,
            "resultid": resultid,
            "category": name
        } 
        qi = QueryInterface()
        #print("toquery=")
        #print(toquery)
        calcdata = qi.processQuery(toquery)
        myfinaldata = self.handleFilters("dataset",{"filters": filts},calcdata)
        resultdata = []
        if len(myfinaldata) > 0:
            resultdata = myfinaldata[0]
        self.etlToDatabase(data["name"],resultdata,mydb)
        # Close the pooled connection
        mydb.close()
        return {"resultid": resultid}




