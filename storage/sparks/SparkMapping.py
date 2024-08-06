
import sys
import os
import json
import sqlite3
import math
import random
import json
import pyspark
from datetime import datetime
import time
from util.DBManager import DBManager 
from pyspark.sql import SparkSession
from pyspark.sql import Row
from common import settings
from sparks.SparkCommon import SparkCommon
from util import calcdate, encryption
from random import randint

config = settings.config()
config.read("settings.cfg")
SCHEMAVER = 2



class SparkMapping:
    def __init__(self):
        self.mydb = DBManager().getConnection()

    def logme(self, s):
        sys.stderr.write("LOGGING: %s\n" % s)

    def isSQLReservedWord(self, t):
        RES = ["from", "select", "where", "to"]
        if t in RES:
            return "%s_" % (t)
        return t

    def maintenance(self,spark,tbl):
        try:
            tsToExpire = calcdate.getTimeIntervalAddHoursRaw(None,-48).strftime("%Y-%m-%d %H:%M:%S")
            spark.deleteOrphanFiles(tbl).execute()
            spark.expireSnapshots(tbl).expireOlderThan(tsToExpire).execute();
        except Exception as e:
            self.logme("Maintenance Failed! Reason: %s" % (str(e)))

    def getSparkConfig(self, table, category):
        masternode = config.getKey("hdfs_master_node")
        timeout = 240
        if config.getKey("spark_app_timeout") is not None:
            timeout = int(config.getKey("spark_app_timeout"))
        if masternode is None:
            self.logme("WARNING: hdfs_master_node isnt configured")
            masternode = "localhost"
        warehouse_loc = "hdfs://%s:9000/warehouse/%s" % (
            masternode,
            table
        )
        catloc = "hdfs://%s:9000/warehouse/schema" % (
            masternode
        )
        spark = SparkSession \
                    .builder \
                    .appName(category) \
                    .config("spark.sql.warehouse.dir", warehouse_loc) \
                    .config("hive.metastore.warehouse.dir", warehouse_loc) \
                    .config("spark.driver.memory", "8g") \
                    .config("spark.yarn.submit.waitAppCompletion", "false") \
                    .config("ipc.client.bind.wildcard.addr", "true") \
                    .config("spark.sql.hive.metastore.version", "3.1.2") \
                    .config("javax.jdo.option.ConnectionURL", "jdbc:mysql://%s:3306/metastore" % config.getKey("mysql_host")) \
                    .config("javax.jdo.option.ConnectionDriverName", "com.mysql.jdbc.Driver") \
                    .config("javax.jdo.option.ConnectionPassword", config.getKey("mysql_pass")) \
                    .config("javax.jdo.option.ConnectionUserName", config.getKey("mysql_user")) \
                    .config("write.metadata.delete-after-commit.enabled","true") \
                    .config("spark.sql.catalog.userdata", "org.apache.iceberg.spark.SparkCatalog") \
                    .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions") \
                    .config("spark.sql.catalog.userdata.type", "hadoop") \
                    .config("spark.sql.catalog.userdata.spark_catalog", "org.apache.iceberg.spark.SparkSessionCatalog") \
                    .config("spark.sql.catalog.userdata.spark_catalog.type", "hive") \
                    .config("spark.yarn.preserve.staging.files", "false") \
                    .config("spark.history.fs.cleaner.enabled", "true") \
                    .config("spark.history.fs.cleaner.maxAge", "12h") \
                    .config("spark.history.fs.cleaner.interval", "12h") \
                    .config("spark.sql.catalog.userdata.warehouse", catloc) \
                    .config("spark.worker.cleanup.enabled","true") \
                    .config("spark.worker.cleanup.appDataTtl","86400") \
                    .config("spark.sql.hive.metastore.jars", "path") \
                    .config("hive.exec.dynamic.partition", "true") \
                    .config("hive.exec.dynamic.partition.mode", "nostrict") \
                    .config("yarn.resourcemanager.app.timeout.minutes", timeout) \
                    .enableHiveSupport() \
                    .getOrCreate()
        return spark
        
    def getType(self, v):
        if v == "False":
            return "boolean", v
        if v == "True":
            return "boolean", v
        if isinstance(v, bool):
            return "boolean", v
        if isinstance(v, int):
            return "bigint", v
        if isinstance(v, float):
            return "double", v
        if isinstance(v, datetime):
            # return "TIMESTAMP(6)", v
            return "int", v
        if isinstance(v, dict):
            return "string", json.dumps(v) 
        if isinstance(v, list):
            return "string", json.dumps(v)
        return "string", v

    def getSchema(self, d, s):
        r = d
        ret = {}
        if isinstance(d, dict):
                r = [d]
        if len(r) < 1:
            raise Exception("NO_SCHEMA_TO_INFER")
        if not isinstance(r, list):
            self.logme(r)
            raise Exception("LIST_EXPECTED")
        for g in r:
            for n in g:
                if n in ret:
                    continue
                k = g[n]
                n = n.replace("-", "")
                if n == "timestamp":
                    k = calcdate.parseDate(k)
                if n == "main_updated":
                    k = calcdate.parseDate(k)
                if n == "created":
                    k = calcdate.parseDate(k)
                t = ''
                v = ''
                if isinstance(k, dict):
                    for q in k:
                        j = "%s_%s" % (n,q)
                        ret[j] = {}
                        t, v = self.getType(k[q])
                        ret[j]['t'] = t
                        ret[j]['v'] = v
                        if j in s:
                            if s[j] != ret[j]['t']:
                                ret[j]['t'] = s[j]
                                self.logme(
                                    "field [%s] (%s) changed to [%s] (was [%s])" % (
                                        j, v, ret[j]['t'], s[j]
                                    ))
                    if n in ret:
                        del ret[n]
                else:
                    t,v = self.getType(k)
                    if n in s:
                        if s[n] != t:
                            ret[n] = {}
                            ret[n]['t'] = s[n]
                            ret[n]['v'] = v
                            self.logme(
                                "field [%s] (%s) changed to [%s] (was [%s])" % (
                                    n, v, t, s[n]
                                ))
                    else:
                        ret[n] = {}
                        ret[n]["v"] = v
                        ret[n]["t"] = t
        return ret

    def getDatabases(self, sph):
        myt = sph.sql("show databases").collect()
        ret = []
        for n in myt:
            ret.append(str(n[0]))
        return ret

    def getTables(self, sph):
        myt = sph.sql("show tables").collect()
        ret = []
        for n in myt:
            ret.append(str(n[1]))
        return ret

    def installobj(self, obj,tbl):
        cur = self.mydb.cursor(buffered=True)
        cur.execute("""
            replace into objhash
                (objid, tstamp, tbl, schema_version) values
                (%s, CURRENT_TIMESTAMP, %s, %s)""", (obj,tbl,SCHEMAVER)
        )
        # print("installing obj/tbl=%s/%s" % (obj,tbl))
        self.mydb.commit()

    def flush(self, sph, Q, I, count=0):
        if len(Q) < 1:
            #logme("Nothing to do, skip")
            return
        if len(I) < 1:
            #logme("Nothing to do, skip")
            return
        F = "%s %s" % (" ".join(Q), "\n".join(I))
        self.logme("f=%s" % F)
        try:
            sph.sql(F)
        except Exception as e:
            self.logme("EXCEPTION in SQL: %s" % str(e))
            l = 0
            try:
                if 'line' in str(e):
                    t = str(e).split("line")
                    # print("spl1: %s" % t)
                    if len(t) > 1:
                        v = t[1].split(",")
                        # print("spl2: %s" % v)
                        if len(v) > 0:
                            v = v[0].strip()
                            try:
                                l = int(v)
                            except:
                                print("Cant parse %s" % v)
                # print("LINE: %s" % l)
                if l > 0:
                    if len(I) > l:
                        try:
                            self.logme("OFFENDINGLINES-1: %s" % I[l-1])
                            self.logme("OFFENDINGLINES-1: %s" % I[l])
                            self.logme("OFFENDINGLINES+1: %s" % I[l+1])
                        except Exception as e:
                            print("NOLINE: %s" % str(e))
            except Exception as e:
                print("COULDNT GET LINE: %s" % (str(e)))
            # logme("---QUERIES")
            # logme(" ".join(Q))
            # logme("---INSERTS")
            # logme("\n".join(I))
            raise e
        self.logme("SAVED %s values" % (len(I),))

    def getDBName(self):
        global SCHEMAVER
        e = "db_%s_%s" % (SCHEMAVER, "sportsbiz")
        return e

    def getColumns(self, sph, tbl):
        myt = sph.sql("describe table %s" % tbl).collect()
        ret = {}
        for n in myt:
            #self.logme("---")
            #self.logme(len(n))
            v = str(n[0])
            if len(v) < 1:
                continue
            if v.startswith("Part"):
                continue
            if v.startswith("Not part"):
                continue
            # partition information has a # in it, skip
            if v.startswith("#"):
                continue
            t = str(n[1])
            ret[v] = t
        return ret

    def createTable(self, sph, name):
        #print("Creating table %s" % name)
        COLS={}
        q = """
            create table %s (
                objid string, 
                timestamp int, 
                main_updated int, 
                tframe int
        ) using iceberg""" % name
        self.logme(q)
        sph.sql(q)
        COLS["objid"] = "string"
        COLS["timestamp"] = "int"
        COLS["main_updated"] = "int"
        COLS["tframe"] = "int"
        return COLS

    def checkOBJ(self, obj, tbl):
        # print("CHEK: %s,%s" % (obj,tbl))
        ret = False
        q = "select * from objhash where objid=%s and tbl=%s and schema_version=%s"
        # print(q)
        cur = self.mydb.cursor(buffered=True)
        f = cur.execute(q, (obj,tbl,SCHEMAVER))
        row = cur.fetchone()
        if row is not None:
            for x in row:
                ret = True
        # print(ret)
        return ret

    def getObjids(self, sph, tbl):
        sd = datetime.now()
        f = sd.strftime("%Y-%m-%dT00:00:00.00Z")
        tftom = calcdate.getTimeIntervalAddHoursRaw(
            calcdate.sysParseDate(f), -24
        ).strftime("%Y%m%d")
        tf = sd.strftime("%Y%m%d")
        f = calcdate.parseDate(f)
        q = """
            select objid from %s where tframe >= %s and tframe < %s
        """ % (tbl, tftom, tf)
        # print("q=%s" % q)
        myt = sph.sql(q).collect()
        for n in myt:
            v = str(n[0])
            installobj(self,v, tbl)

    def writeSPARK(self, table, sph, data, r=None, cache=False):
        EXCLUSION=[
            "changelog", "enabled", "deleted", 
            "aws", "certificate", ""
        ]
        sc = SparkCommon()
        sph.sql("use userdata");
        getdata=True
        DBNAME=self.getDBName()
        TBLNAME="%s" % (table,)
        # self.logme("DBNAME=%s" % DBNAME)
        #self.logme("TBLNAME=%s" % TBLNAME)
        COLS = {}
        TBLS = []
        if r is not None:
            getdata = False
        DBS=self.getDatabases(sph)
        # self.logme("DBS=%s" % DBS)
        if DBNAME not in DBS:
            print("creating database %s" % DBNAME)
            sph.sql("create database userdata.%s" % DBNAME)
        sph.sql("use userdata.%s" % DBNAME)
        TBLS = self.getTables(sph)
        if 'default' not in TBLS:
            self.createTable(sph, 'default')
        # self.logme("TBLS=%s" % TBLS)
        if TBLNAME in TBLS:
            COLS=self.getColumns(sph, TBLNAME)
        else:
            COLS=self.createTable(sph, TBLNAME)
        sc = SparkCommon()
        # self.logme("COLS=%s" % COLS)
        self.getObjids(sph, TBLNAME)
        if config.getKey("hdfs_max_records") is not None:
            MAX=int(config.getKey("hdfs_max_records"))
        cols = types = values = None
        SKIP = 0
        COMPLETE = 0
        schema = {}
        commasep = False
        FLUSHED = False
        QUERY = []
        COLSIZE = 0
        OBJLIST = []
        INS = []
        SL_FNAME=".schemalock-%s" % TBLNAME
        lcntr = 0
        c = 0
        while os.path.exists(SL_FNAME):
            time.sleep(5+(randint(1,99)/10))
            c += 1
            if c > 1800:
                os.path.unlink(SL_FNAME)
                raise Exception("Timeout waiting for schemalock")
            if c % 10 == 0:
                self.logme("Waiting for %s, %s attempts" % (SL_FNAME,c))
        H=open(SL_FNAME,"w")
        H.close()
        try:
            for row in data: 
                # print(row)
                lcntr += 1 
                if lcntr % 5 == 0:
                    self.mydb.commit()
                if 'objid' not in row:
                    neo = encryption.getSHA256(json.dumps(row, sort_keys=True))
                    row['objid'] = neo
                if self.checkOBJ(row['objid'], TBLNAME):
                    SKIP += 1
                    # self.logme("skip/comp:  %s/%s" % (SKIP, COMPLETE))
                    continue
                f = row['objid']
                OBJLIST.append(f)
                schema = self.getSchema([row], COLS)
                c = 0
                for g in schema:
                    if g in EXCLUSION and g not in COLS:
                        continue
                    if g not in COLS:
                        COMPLETE += len(INS)
                        self.flush(sph, QUERY, INS)
                        FLUSHED=True
                        b = """
                            alter table %s add columns (%s %s)
                        """ % (TBLNAME, g, schema[g]['t'])
                        self.logme(b)
                        sph.sql(b)
                        QUERY = []
                        INS = []
                        COLS[g] = schema[g]['t']
                if len(QUERY) < 1:
                    commasep = False
                    QUERY.append("insert into table %s" % TBLNAME)
                    QUERY.append("(")
                    QUERY.append(",".join(COLS))
                    QUERY.append(")")
                    QUERY.append("VALUES")
                G=""
                R=""
                for g in COLS:
                    # print("iterating: %s" % g)
                    ts = False
                    if g in EXCLUSION:
                        continue
                    # self.logme("COLUMN: %s" % g)
                    quote = True
                    if g in schema:
                        if schema[g]['t'] == "string":
                            quote = True
                        elif schema[g]['t'] == "timestamp":
                            quote = False
                        else:
                            quote = False
                    # self.logme("COL: %s, type:%s" % (g, COLS[g]))
                    v = ''
                    if COLS[g] != "string":
                        v = 0
                        
                    if g in row:
                        v = row[g]
                    if "." in g:
                        ref = g.split(".")
                        if len(ref) > 2:
                            raise Exception("malformed_dict_specifier")
                        a = ref[0]
                        b = ref[1]
                        v = row[a][b]
                        # self.logme("dref: %s" % v)
                    if g == "timestamp" or g == "created" or g == "main_updated":
                        if str(v).startswith("20"):
                            h = calcdate.parseDate(v)
                            # h = h.strftime("%S")
                            h = time.mktime(h.timetuple())
                            v = h
                        elif g == "main_updated":
                            v = int(time.time())
                    if g == "tframe":
                        if 'timestamp' in row:
                            t = row['timestamp']
                            t = calcdate.parseDate(t)
                            v = t
                            if not isinstance(t, int):
                                v = t.strftime("%Y%m%d")
                            quote = False
                    if isinstance(v, list):
                        v = json.dumps(v)
                    if COLS[g] == "boolean":
                        quote = False
                        if v:
                            v = "true"
                        if not v:
                            v = "false"
                    if COLS[g] == "int" or COLS[g] == "bigint":
                        quote = False
                        try:
                            v = int(v)
                        except Exception as e:
                            # self.logme("failed to cast [%s] %s to int (%s), setting to 0" % (v, str(e), g))
                            v = 0
                    if COLS[g] == "double":
                        quote = False
                        try:
                            v = float(v)
                        except Exception as e:
                            # self.logme("failed to cast [%s] %s to double (%s), setting to 0" % (v, str(e), g))
                            v = 0
                    # self.logme(v)
                    # self.logme("val:[%s], quo: %s, type:%s" % (v, quote, COLS[g]))
                    if len(G) < 1 and quote:
                        # use json.dumps to quotify
                        G = "%s" % (json.dumps(str(v)),) 
                    elif len(G) > 0 and quote:
                        # use json.dumps to quotify
                        G = "%s,%s" % (G, json.dumps(str(v)))
                    elif len(G) < 1 and not quote:
                        G = "%s" % (v,) 
                    elif len(G) > 0 and not quote:
                        G = "%s,%s" % (G, v) 
                if len(INS) > 2*1024:
                    COMPLETE += len(INS)
                    self.flush(sph, QUERY, INS)
                    for gg in OBJLIST:
                        self.installobj(gg,TBLNAME)
                    commasep = False
                    INS=[]
                if commasep:
                    INS.append(",")
                else:
                    commasep = True
                INS.append("(%s)" % G)
        except Exception as e:
            raise e
        finally:
            if os.path.exists(SL_FNAME):
                os.unlink(SL_FNAME)
        self.logme("--- FILEDONE")
        if not FLUSHED:
            COMPLETE += len(INS)
        self.flush(sph, QUERY, INS)
        for gg in OBJLIST:
            self.installobj(gg,TBLNAME)
        self.logme("--- END")
        self.logme("STATS: skip/comp: %s/%s" % (SKIP, COMPLETE))
        # Close the pooled connection
        if random.randint(1,100) > 98:
            self.maintenance(spark,TBLNAME)
        self.mydb.close()
        return {"skip": SKIP, "complete": COMPLETE}

