# coding=utf-8

import os
import json
import unittest
from common import settings
from util.DBManager import DBManager 
from processing.ProcessingBase import ProcessingBase

config = settings.config()
config.read("settings.cfg")

class ThrottleControl(ProcessingBase):

    def __init__(self):
        super().__init__()

    def process(self, name):
        if(config.getKey("no_throttle")):
            return
        query = "select id,name,timestampdiff(minute,lastrun,now()) from throttle_check where name=%s"
        mydb = DBManager().getConnection()
        db = mydb.cursor(buffered=True)
        db.execute(query,(name,))
        ret = False;
        for x in db.fetchall():
            if x[2] < 5:
                print("throttle request for class %s, %s minutes" % (x[1],x[2]))
                ret = True
        if not ret:
            query = "replace into throttle_check (name,lastrun) values (%s,NOW())"
            db.execute(query,(name,))
            mydb.commit()
        # Close the pooled connection
        mydb.close()
        return ret



