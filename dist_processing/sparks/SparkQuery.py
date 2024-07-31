#!/usr/bin/python
import os
import requests
import sys
import argparse
import json
from pyspark.sql import SparkSession
from common import settings
from util import encryption, calcdate
from sparks.SparkMappingQuery import SparkMappingQuery
from sparks.SparkEntry import SparkEntry
config = settings.config()
config.read("settings.cfg")

class SparkQuery(SparkEntry):


    def __init__(self):
        super().__init__()

    def process(self, table, category, query):
        ret = []
        spark = None
        try: 
            smq = SparkMappingQuery()
            spark = smq.getSparkConfig(table, category)
            ret = smq.querySPARK(spark, query)
        except Exception as e:
            raise e
        finally:
            if spark is not None:
                spark.stop()
        return ret



