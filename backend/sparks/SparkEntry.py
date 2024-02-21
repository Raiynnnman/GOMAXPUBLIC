#!/usr/bin/python
import os
import requests
import sys
import argparse
import json
from pyspark.sql import SparkSession
from common import settings
from util import encryption, calcdate
from sparks.SparkMapping import SparkMapping
config = settings.config()
config.read("settings.cfg")

class SparkEntry:


    def __init__(self):
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



    def process(self, category, table, data):
        ret = []
        spark = None
        try:
            mapper = SparkMapping()
            spark = mapper.getSparkConfig(table, category)
            if isinstance(data, str):
                data = json.loads(data)
            if not isinstance(data, list):
                raise Exception("EXPECTED LIST")
            ret = mapper.writeSPARK( table, spark, data )
        except Exception as e:
            raise e
        finally:
            if spark is not None:
                spark.stop()
        return ret



