
import os
import sys
sys.path.append(os.getcwd())  # noqa: E402
from util import calcdate
from common.SparkSQLException import SparkSQLException
from sparks.SparkMapping import SparkMapping


sm = SparkMapping()
spark = sm.getSparkConfig('default','pain')
spark.sql("use userdata.db_1_pan")
t = spark.sql("show tables").collect()

for g in t:
    s = """drop table  %s
        """ % ("userdata.db_1_pain.%s" % g['tableName'],)
    print(s)
    spark.sql(s)

