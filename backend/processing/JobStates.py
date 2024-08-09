# coding=utf-8

import os
import json
import random
import unittest
from util import encryption, S3Processing
from util.DBManager import DBManager 
from processing.ProcessingBase import ProcessingBase



class JobStates(ProcessingBase):
    jobid = None    
    isactive = 1
    isdsjob = 0

    def __init__(self):
        super().__init__()

    def doJenkins(self):
        return False

    def getStatusValues(self):
        STATUS = { }
        query = "select id,value from status order by id"
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        db.execute(query)
        for x in db.fetchall():
            STATUS[x[1]] = x[0]
        # Close the pooled connection
        mydb.close()
        return STATUS

    def setJobID(self, j):
        # print("set jobid: %s" % j)
        self.jobid = j

    def setIsActive(self, j):
        self.isactive = j

    def setIsDSJob(self, j):
        self.isdsjob = j

    def getIsActive(self):
        return self.isactive 

    def getJobID(self):
        return self.jobid

    def initializeJobID(self):
        jobname = "job-%s" % encryption.getSHA256()
        # print("generating job: %s" % jobname)
        mydb = DBManager().getConnection()
        curs = mydb.cursor()
        query = "insert into jobs (job_id, curr_status, is_storage_job) values (%s, %s, %s)"
        curs.execute(query, (jobname, 0,self.isdsjob))
        self.jobid = curs.lastrowid
        mydb.commit()
        # Close the pooled connection
        mydb.close()

    def jobStatus(self,status):
        if self.jobid is None:
            raise Exception("NO_JOBID")
        STATUS=self.getStatusValues()
        mydb = DBManager().getConnection()
        curs = mydb.cursor()
        query = "insert into job_status_history (job_id, status_id) values (%s, %s)"
        curs.execute(query, (self.jobid, STATUS[status]));
        query = "update jobs set curr_status = %s where id=%s"
        curs.execute(query, (STATUS[status],self.jobid));
        mydb.commit()
        # Close the pooled connection
        mydb.close()

    def jobQueued(self):
        if self.jobid is None:
            self.initializeJobID()
        # print("QUEUED:%s" % self.jobid)
        self.jobStatus("QUEUED")

    def jobStarted(self):
        self.jobStatus("STARTED")

    def jobRunning(self):
        self.jobStatus("RUNNING")

    def jobError(self):
        self.jobStatus("ERROR")

    def jobComplete(self):
        self.jobStatus("COMPLETE")
        mydb = DBManager().getConnection()
        curs = mydb.cursor()
        if random.randint(0,100) < 75:
            query = "delete from jobs where updated < date_add(NOW(), INTERVAL -30 DAY);"
            curs.execute(query)
            mydb.commit()
        if random.randint(0,100) > 75:
            query = "delete from errorlog where job_id not in (select id from jobs);"
            curs.execute(query)
            mydb.commit()
        if random.randint(0,100) > 75:
            query = "delete from joblog where job_id not in (select id from jobs);"
            curs.execute(query)
            mydb.commit()
        mydb.close()

