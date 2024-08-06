# coding=utf-8

import os
import json
import unittest
from processing.SubmitDataRequest import SubmitDataRequest
from sparks.SparkEntry import SparkEntry
from sparks.SparkQuery import SparkQuery


class InsertDataRequest(SubmitDataRequest):

    def insertDataFromFilter(self, mysubmitdata):
        final_table_data = {}
        final_update_data = []
        tbl = ''
        insertData = []
        se = SparkEntry()
        for action in mysubmitdata:
            for item in action:
                if 'action' in item:
                    if item['action']['action'] == "ADD_TO_TABLE":
                        table = item['action']['table']
                        insertData = item['data']
                        if table not in final_table_data:
                            final_table_data[table] = {"table":table,"data":[]}
                        final_table_data[table]["data"].append(item['data'])
                    if item['action']['action'] == "UPDATE_TABLE_VALUE":
                        tbl = item['action']['table']
                        myid = item['data']['id']
                        myvalue = item['data']['value']
                        mycol = item['data']['column']
                        final_update_data.append("""
                            update %s set %s = %s where objid="%s"
                        """ % (tbl, mycol, myvalue, myid))
        if len(final_table_data) > 0:
            for d in final_table_data:
                table = final_table_data[d]['table']
                insertData = final_table_data[d]['data']
                se.process("pain.%s" % table, table, insertData)
        if len(final_update_data) > 0:
            smq = SparkQuery()
            for d in final_update_data:
                smq.process("default", "update", d)
