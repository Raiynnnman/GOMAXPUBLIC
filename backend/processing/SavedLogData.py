# coding=utf-8

import os
import json
from util.DBManager import DBManager 
from processing.ProcessingBase import ProcessingBase

class SavedLogData(ProcessingBase):

    def process(self, jobid, classname, data):
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "insert into joblog (job_id, classname, data) values (%s, %s, %s)"
        db.execute(query, (jobid, classname, data));
        mydb.commit()
        # Close the pooled connection
        mydb.close()


