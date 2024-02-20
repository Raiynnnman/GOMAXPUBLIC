# coding=utf-8

import sys
import os
import json
import unittest

sys.path.append(os.path.realpath(os.curdir))

from util.DBOps import Query

class Audit:

    def message(self, success, user_id, office_id, message,metadata):
        db = Query()
        db.update("""
            insert into audit_list (success,user_id,office_id,message,metadata) values 
                (%s,%s,%s,%s,%s)
        """,(success,user_id,office_id,message,metadata))
        db.commit()
        
