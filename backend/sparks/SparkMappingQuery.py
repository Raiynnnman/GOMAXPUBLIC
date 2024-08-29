
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
from util.Logging import Logging

config = settings.config()
config.read("settings.cfg")
log = Logging()


class SparkMappingQuery(SparkMapping):

    def querySPARK(self, sph, query, orderby='created', pageSize=100, page=0, system=False):
        ret = {}
        data = []
        try:
            DBNAME = self.getDBName()
            cnt = None
            sph.sql("use userdata.%s" % DBNAME)
            if page == 0 and not system:
                cnt = sph.sql("select count(*) as t from (%s)" % query)
                for x in data:
                    cnt = x[0]
                print("cnt2=%s" % cnt)
            if 'order by' not in query and not system:
                query += " order by %s " % orderby
            if 'limit' not in query and not system:
                query += " limit %s offset %s " % (pageSize,pageSize*page)
            frame = sph.sql(query)
            data = frame.collect()
            g = []
            cols = frame.columns
            for x in data:
                C = 0
                r = {}
                while C < len(cols):
                    r[cols[C]] = x[C]
                    C += 1
                g.append(r)
            ret['data'] = list(g)
            ret['columns'] = cols
        except Exception as e:
            raise e
        return (cnt,ret)

