# coding=utf-8

import os
import json
from util.DBManager import DBManager 
from processing.ProcessingBase import ProcessingBase

class SavedFileData(ProcessingBase):

    def process(self, jobid, classname, filename):
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        query = "insert into files (job_id, classname, filename) values (%s, %s, %s)"
        db.execute(query, (jobid, classname, filename));
        mydb.commit()
        query = "delete from files where updated < date_add(NOW(), INTERVAL -30 DAY);"
        db.execute(query)
        mydb.commit()
        # Close the pooled connection
        mydb.close()


