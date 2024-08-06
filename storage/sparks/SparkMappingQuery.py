
import sys
import os
import json
import sqlite3
import math
import json
import pyspark
from datetime import datetime
from pyspark.sql import SparkSession
from pyspark.sql import Row
from common import settings
from sparks.SparkCommon import SparkCommon
from sparks.SparkMapping import SparkMapping
from util import calcdate, encryption

config = settings.config()
config.read("settings.cfg")


class SparkMappingQuery(SparkMapping):
    def logme(self, s):
        sys.stderr.write("LOGGING: %s\n" % s)

    def querySPARK(self, sph, query):
        data = []
        try:
            DBNAME = self.getDBName()
            sph.sql("use userdata.%s" % DBNAME)
            frame = sph.sql(query)
            data = frame.collect()
            data.insert(0,frame.columns)
        except Exception as e:
            raise e
        return data

