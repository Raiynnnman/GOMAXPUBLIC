
import sys
import os
import re
import traceback
import json
import sqlite3
import math
import random
import json
import pyspark
from datetime import datetime
import time
from util.DBManager import DBManager 
from util.DBOps import Query
from util.Performance import performance
from common.SparkSQLException import SparkSQLException
from pyspark.sql import SparkSession
from pyspark.sql import Row
from common import settings
from sparks.SparkCommon import SparkCommon
from util import calcdate, encryption
from random import randint
from sparks.SparkBase import SparkBase
from util.Logging import Logging

config = settings.config()
config.read("settings.cfg")
log = Logging()

class SparkMapping(SparkBase):

    __spark__ = None
    __db__ = None
    __TOTAL_ROWS__  = 0
    __COMPLETE__ = 0
    __SKIP__ = 0
    __OBJIDS__ = {}
    __DEDUP__ = True

    def __init__(self):
        super().__init__()

    def isSQLReservedWord(self, t):
        RES = ["from", "select", "where", "to"]
        if t in RES:
            return "%s_" % (t)
        return t

    def setDedup(self,c):
        self.__DEDUP__ = c

    def maintenance(self,spark,tbl):
        return
        try:
            tsToExpire = calcdate.getTimeIntervalAddHoursRaw(None,-48).strftime("%Y-%m-%d %H:%M:%S")
            s = """call system.expire_snapshots(table=>'%s',retain_last => 5)
                """ % (g['tableName'],)
            spark.sql(s)
        except Exception as e:
            log.debug("Maintenance Failed! Reason: %s" % (str(e)))

    def setEnv(self):
        had_home = config.getKey("hadoop_home")
        jdk_home = config.getKey("jdk_home")
        spark_home = config.getKey("spark_home")
        os.environ["JAVA_HOME"] = jdk_home
        os.environ["HADOOP_HOME"] = had_home
        os.environ["HADOOP_INSTALL"] = had_home
        os.environ["HADOOP_MAPRED_HOME"] = had_home
        os.environ["HADOOP_COMMON_HOME"] = had_home
        os.environ["HADOOP_HDFS_HOME"] = had_home
        os.environ["YARN_CONF_DIR"] = os.path.join(had_home,"etc","hadoop")
        os.environ["HADOOP_YARN_HOME"] = had_home
        os.environ["HADOOP_COMMON_LIB_NATIVE_DIR"] = os.path.join(had_home,"lib","native")
        os.environ["HADOOP_OPTS"] = "-Djava.library.path=%s" % os.path.join(had_home,"lib","native")
        # os.environ["HIVE_HOME"] = $HADOOP_HOME/../hive
        os.environ["SPARK_HOME"] = os.path.join(had_home,"..", spark_home)
        # os.environ["PATH"] = $PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin:$HIVE_HOME/bin:$HADOOP_HOME/../hbase/bin

    def getSparkConfig(self, table, category):
        self.setEnv()
        masternode = config.getKey("hdfs_master_node")
        timeout = 240
        if config.getKey("spark_app_timeout") is not None:
            timeout = int(config.getKey("spark_app_timeout"))
        if masternode is None:
            log.debug("WARNING: hdfs_master_node isnt configured")
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
                    .config("spark.driver.memory", "4g") \
                    .config("spark.master", "yarn") \
                    .config("spark.yarn.submit.waitAppCompletion", "false") \
                    .config("ipc.client.bind.wildcard.addr", "true") \
                    .config("javax.jdo.option.ConnectionURL", "jdbc:mysql://%s:3306/pain" % config.getKey("mysql_host")) \
                    .config("javax.jdo.option.ConnectionDriverName", "com.mysql.jdbc.Driver") \
                    .config("javax.jdo.option.ConnectionPassword", config.getKey("mysql_pass")) \
                    .config("javax.jdo.option.ConnectionUserName", config.getKey("mysql_user")) \
                    .config("write.metadata.delete-after-commit.enabled","true") \
                    .config("write.metadata.previous-versions-max", 10) \
                    .config("spark.sql.catalog.userdata", "org.apache.iceberg.spark.SparkCatalog") \
                    .config("spark.driver.extraJavaOptions", "-Dlog4j.rootCategory='ERROR, console'") \
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
                    .config("hive.exec.dynamic.partition", "true") \
                    .config("log4j.rootCategory","DEBUG, console") \
                    .config("spark.log4j.rootCategory","DEBUG, console") \
                    .config("spark.network.timeout","120s") \
                    .config("spark.shuffle.io.connectionTimeout","120s") \
                    .config("spark.shuffle.blockTransferService","nio") \
                    .config("hive.exec.dynamic.partition.mode", "nostrict") \
                    .config("yarn.resourcemanager.app.timeout.minutes", timeout) \
                    .enableHiveSupport() \
                    .getOrCreate()
        self.__spark__ = spark
        return spark
        
    def getType(self, f, v):
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
        if f == 'created':
            return "timestamp", 'current_timestamp()'
        if f == 'updated':
            return "timestamp", 'current_timestamp()'
        if 'time' in f:
            log.debug("ts_type: 1")
            return "timestamp", v
        if 'date' in f:
            log.debug("ts_type: 2")
            return "timestamp", v
        if re.match(r'\d{4}-\d\d-\d\dT\d{2}',str(v)):
            log.debug("ts_type: 3")
            v = v.replace("T"," ")
            v = v.replace("Z","")
            return "timestamp", v
        if re.match(r'\d{4}-\d\d-\d\d \d{2}',str(v)):
            log.debug("ts_type: 4")
            return "timestamp", v
        if isinstance(v, datetime):
            log.debug("ts_type: 5")
            return "timestamp", v
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
            log.debug(r)
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
                        t, v = self.getType(k,k[q])
                        # log.debug("getType: %s,%s = %s,%s" % (k,k[q],t,v))
                        ret[j]['t'] = t
                        ret[j]['v'] = v
                    if n in ret:
                        del ret[n]
                else:
                    t,v = self.getType(n,k)
                    # log.debug("getType: %s,%s = %s,%s" % (n,k,t,v))
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
        self.__OBJIDS__[obj] = 1
        return
        #self.__db__.update("""
        #    replace into datastorage_objhash
        #        (objid, tstamp, tbl, schema_version) values
        #        (%s, CURRENT_TIMESTAMP, %s, %s)""", (obj,tbl,self.getSchemaVer())
        #)

    def flush(self, sph, Q, I, count=0):
        p = performance()
        p.start("sparkFlush")
        if len(Q) < 1:
            #logme("Nothing to do, skip")
            return
        if len(I) < 1:
            #logme("Nothing to do, skip")
            return
        F = "%s %s" % (" ".join(Q), "\n".join(I))
        F = F.replace(",,",",'',")
        #log.debug("INS-----")
        #log.debug("\n" + "\n".join(I))
        try:
            sph.sql(F)
        except Exception as e:
            log.debug("EXCEPTION in SQL: %s" % str(e))
            raise SparkSQLException(e)
        log.debug("TTS: %s" % p.stop())
        log.debug("C/S/T/R=%s/%s/%s/%s - %2.2f%%" % (
            self.__COMPLETE__,self.__SKIP__,self.__TOTAL_ROWS__,len(I),
            ((self.__COMPLETE__ + self.__SKIP__)/self.__TOTAL_ROWS__) * 100
        ))

    def getDBName(self):
        e = "db_%s_%s" % (self.getSchemaVer(), "pain")
        return e

    def getColumns(self, sph, tbl):
        myt = sph.sql("describe table %s" % tbl).collect()
        ret = {}
        for n in myt:
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
        COLS={}
        q = """
            create table %s (
                id string, 
                objid string, 
                created timestamp, 
                updated timestamp, 
                tframe int
        ) using iceberg""" % name
        # log.debug(q)
        sph.sql(q)
        COLS["id"] = "string"
        COLS["objid"] = "string"
        COLS["created"] = "timestamp"
        COLS["updated"] = "timestamp"
        COLS["tframe"] = "int"
        sph.sql("""alter table %s set TBLPROPERTIES (
            'history.expire.min-snapshots-to-keep'='5',
            'history.expire.max-snapshot-age-ms'='10000000'
        )""" % name)
        return COLS

    def checkOBJ(self, obj, tbl):
        if obj in self.__OBJIDS__:
            return True
        return False
        #p = performance()
        #p.start("checkOBJ")
        #ret = False
        #q = "select * from datastorage_objhash where objid=%s and tbl=%s and schema_version=%s"
        #rows = self.__db__.query(q, (obj,tbl,self.getSchemaVer()))
        #for x in rows:
        #    ret = True
        #    break
        # log.debug("chkobj: %s" % p.stop())
        #return ret

    def getObjids(self, sph, tbl):
        return
        q = """
            select objid from %s 
        """ % (tbl, )
        myt = sph.sql(q).collect()
        for n in myt:
            v = str(n[0])
            self.installobj(v, tbl)
        self.__db__.commit()

    def writeSPARK(self, table, sph, data, r=None, cache=False):
        self.__db__ = Query()
        EXCLUSION=[
            "changelog", "enabled", "deleted", 
            "aws", "certificate", ""
        ]
        sc = SparkCommon()
        sph.sql("use userdata");
        getdata=True
        DBNAME=self.getDBName()
        TBLNAME="%s" % (table,)
        WRITE_SIZE = 2048
        self.__TOTAL_ROWS__ = len(data)
        COLS = {}
        TBLS = []
        if r is not None:
            getdata = False
        DBS=self.getDatabases(sph)
        if DBNAME not in DBS:
            print("creating database %s" % DBNAME)
            sph.sql("create database userdata.%s" % DBNAME)
        sph.sql("use userdata.%s" % DBNAME)
        TBLS = self.getTables(sph)
        if 'default' not in TBLS:
            self.createTable(sph, 'default')
        if TBLNAME in TBLS:
            COLS=self.getColumns(sph, TBLNAME)
        else:
            COLS=self.createTable(sph, TBLNAME)
        sc = SparkCommon()
        self.getObjids(sph, TBLNAME)
        if config.getKey("hdfs_max_records") is not None:
            MAX=int(config.getKey("hdfs_max_records"))
        cols = types = values = None
        self.__SKIP__ = 0
        self.__COMPLETE__ = 0
        schema = {}
        commasep = False
        FLUSHED = False
        QUERY = []
        COLSIZE = 0
        OBJLIST = {}
        INS = []
        lcntr = 0
        c = 0
        try:
            for row in data: 
                __DEDUP__ = True
                if 'dedup' in row:
                    __DEDUP__ = row['dedup']
                p = performance()
                p.start("SparkMapping")
                lcntr += 1 
                if 'objid' not in row:
                    neo = encryption.getSHA256(json.dumps(row, sort_keys=True))
                    row['objid'] = neo
                    row['id'] = neo
                if __DEDUP__:
                    if row['objid'] in OBJLIST or self.checkOBJ(row['objid'], TBLNAME):
                        self.__SKIP__ += 1
                        continue
                f = row['objid']
                OBJLIST[f] = 1
                schema = self.getSchema([row], COLS)
                c = 0
                for g in schema:
                    if g in EXCLUSION and g not in COLS:
                        continue
                    if g not in COLS:
                        self.flush(sph, QUERY, INS)
                        FLUSHED=True
                        b = """
                            alter table %s add columns (%s %s)
                        """ % (TBLNAME, g, schema[g]['t'])
                        log.debug(b)
                        sph.sql(b)
                        QUERY = []
                        INS = []
                        COLS[g] = schema[g]['t']
                if len(QUERY) < 1:
                    commasep = False
                    QUERY.append("insert into table %s \n" % TBLNAME)
                    QUERY.append("(")
                    QUERY.append(",".join(COLS))
                    QUERY.append(")\n")
                    QUERY.append("VALUES\n")
                G=""
                R=""
                for g in COLS:
                    ts = False
                    if g in EXCLUSION:
                        continue
                    quote = True
                    if g in schema:
                        if schema[g]['t'] == "string":
                            quote = True
                        elif schema[g]['t'] == "timestamp":
                            quote = False
                        else:
                            quote = False
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
                    if g == "tframe":
                        v = int(datetime.utcnow().strftime("%Y%m%d"))
                        quote = False
                    if isinstance(v, list):
                        v = json.dumps(v)
                    if COLS[g] == "boolean":
                        quote = False
                        if v:
                            v = "true"
                        if not v:
                            v = "false"
                    if COLS[g] == "timestamp":
                        quote = False
                        # v = calcdate.parseDate(v).strftime("%s")
                        if 'T' in str(v):
                            v = v.replace("T"," ")
                        v = "cast(date_format('%s', 'yyyy-MM-dd HH:mm:ss.SSS') as timestamp)" % v
                    if COLS[g] == "int" or COLS[g] == "bigint":
                        quote = False
                        try:
                            v = int(v)
                        except Exception as e:
                            v = 0
                    if COLS[g] == "double":
                        quote = False
                        try:
                            v = float(v)
                        except Exception as e:
                            v = 0
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
                if len(INS) > WRITE_SIZE: 
                    self.flush(sph, QUERY, INS)
                    #p = performance()
                    #p.start("installobjs")
                    #for gg in OBJLIST:
                    #    if OBJLIST[gg] == 1:
                    #        self.installobj(gg,TBLNAME)
                    #        OBJLIST[gg] = 2
                    #self.__db__.commit()
                    #log.debug("dedupobj: %s" % p.stop())
                    commasep = False
                    INS=[]
                if commasep:
                    INS.append(",")
                else:
                    commasep = True
                INS.append("(%s)" % G)
                self.__COMPLETE__ += 1
            log.debug("rowproc: %s" % p.stop())
        except Exception as e:
            traceback.print_exc(file=sys.stdout)
            raise SparkSQLException(str(e))
        finally:
            pass
        log.debug("COMPIS NOW: %s" % self.__COMPLETE__)
        self.flush(sph, QUERY, INS)
        self.__db__.commit()
        #for gg in OBJLIST:
        #    if OBJLIST[gg] == 1:
        #        self.installobj(gg,TBLNAME)
        #log.debug("COMPIS END: %s"%  self.__COMPLETE__)
        # log.debug("STATS: skip/comp: %s/%s" % (self.__SKIP__, self.__COMPLETE__))
        self.__db__.commit()
        # self.maintenance(sph,TBLNAME)
        return {"skip": self.__SKIP__, "complete": self.__COMPLETE__}

