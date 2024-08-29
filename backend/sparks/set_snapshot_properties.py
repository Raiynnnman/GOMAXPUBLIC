
import os
import sys
sys.path.append(os.getcwd())  # noqa: E402
from util import calcdate
from common.SparkSQLException import SparkSQLException
from sparks.SparkMapping import SparkMapping


sm = SparkMapping()
spark = sm.getSparkConfig('default','pain')
spark.sql("use userdata.db_1_pain")
t = spark.sql("show tables").collect()

for g in t:
    print(g)
    s = """
        alter table %s set TBLPROPERTIES (
            'history.expire.min-snapshots-to-keep'='5',
            'write.metadata.delete-after-commit.enabled'='true',
            'history.expire.max-snapshot-age-ms'='10000000'
        )
        """ % (g['tableName'],)
    print("s=%s" % s)
    spark.sql(s)

