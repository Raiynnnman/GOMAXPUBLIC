# coding=utf-8

import os
import sys
import json
import unittest
import base64
import pickle
import copy
import traceback
from util import encryption, S3Processing
from util import Performance
from processing.run import app
from flask import request, jsonify
from common.DataException import DataException
from common.SparkSQLException import SparkSQLException
from common.InvalidParameterException import InvalidParameterException
from common import settings
from processing import JobStates
from processing.SavedFileData import SavedFileData
from processing.ProcessingBase import ProcessingBase
from py4j.protocol import Py4JJavaError

config = settings.config()
config.read("settings.cfg")


@app.task(bind=True)
def submit_task_wrapper(self, *args):
    if args is None or len(args) < 1:
        raise EngineException("MISSING_ARGUMENT_TO_QUEUE")
    a = copy.deepcopy(args[0])
    if a is None or len(a) < 1:
        raise EngineException("MISSING_ARGUMENT_TO_QUEUED_INSTANCE")

    myc = args[0][0]
    if myc.startswith("{"):
        myc = json.loads(myc)
    dp = pickle.loads(
        base64.b64decode(myc.encode('utf-8'))
    )
    a.pop(0)
    try:
        if isinstance(a, str):
            a = json.loads(a)
        dp.run(a)
    except DataException as de:
        raise de
    except InvalidParameterException as ipe:
        raise ipe
    except Py4JJavaError as p4j:
        raise p4j
    except SparkSQLException as sse:
        raise sse
    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        print(str(e)) # EXCEPTION
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
        raise self.retry(exc=e, countdown=60, args=args)

class SubmitDataRequest(ProcessingBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return True

    __jobid = 0

    def defer(self, data):
        dp = base64.b64encode(pickle.dumps(self)).decode('utf-8')
        nargs = (dp, data)
        try:
            qitem = submit_task_wrapper.delay(nargs)
            qitem.forget()
        except NotImplementedError as NIE:
            # The backend doesnt have forget, pass on it
            pass
        except Exception as e:
            raise e

    def getArgs(self,*args,**kwargs):
        jobid = args[0]
        off_id = 0
        if isinstance(args[1],list):
            user = args[1][0]
        else:
            user = args[1]
        if 'offices' in user and len(user['offices']) > 0:
            off_id = user['offices'][0]
        if 'context' in user and user['context']:
            off_id = user['contextValue']['id']
        postdata = None
        if len(args[1]) > 1 and isinstance(args[1],list):
            postdata = args[1][1]
        return (jobid,user,off_id,postdata)

    def execute(self, *args, **kwargs):
        raise Exception("DERIVED_CLASS_MUST_IMPLEMENT")

    def process(self, *args, **kwargs):
        jobstate = None
        jobstate = JobStates.JobStates()
        jobstate.jobQueued()
        if not self.isDeferred():
            jobstate.setIsActive(0)
        proc = []
        if len(args) > 0:
            proc = args[0]
        path = "%s/%s.json" % (
            "requests", 
            encryption.getSHA256(encryption.getRandomChars(r=64))
        )
        if not config.getKey("local_storage") and not self.isDeferred():
            S3Processing.uploadS3ItemToBucket(
                config.getKey("request_bucket_access_key"),
                config.getKey("request_bucket_access_secret"),
                config.getKey("request_bucket"),
                path,
                "application/json",
                json.dumps(proc)
            )
        else:
            if not os.path.exists("requests"):
                os.mkdir("requests")
            H=open(path,"w")
            H.write(json.dumps(proc))
            H.close()
        d = { "s3data": path, "jobid":jobstate.getJobID() }
        ret = {}
        if self.isDeferred() and config.getKey("use_defer"):
            self.defer(d)
            ret = {"jobid": jobstate.getJobID()}
        else:
            d['data'] = proc
            ret = self.run(d)
        return ret

    def run(self, *args, **kwargs):
        task = args[0]
        if isinstance(task, str):
            task = json.loads(task)
        if isinstance(task, list):
            task = task[0]
        jobstate = JobStates.JobStates()
        jobstate.setJobID(task['jobid'])
        self.__jobid = task['jobid']
        data = task
        s3path = data['s3data']
        jobstate.jobStarted()
        if 's3data' in data and config.getKey("local_storage"):
            s3path = data['s3data']
            H=open(s3path,"r")
            r = H.read()
            r = json.loads(r)
            H.close()
            data = r
        elif 's3data' in data and not config.getKey("local_storage"):
            s3path = data['s3data']
            data = S3Processing.downloadS3ItemFromBucket(
                    config.getKey("request_bucket_access_key"),
                    config.getKey("request_bucket_access_secret"),
                    config.getKey("request_bucket"),
                    s3path
            )
            if isinstance(data, str):
                data = json.loads(data)
            if isinstance(data, bytes):
                data = json.loads(data.decode('utf-8'))
        elif 'data' not in data:
            H=open(s3path,"r")
            data = H.read()
            H.close()
            data = json.loads(data)
        jobstate.jobRunning()
        perf = Performance.performance()
        try:
            if isinstance(data, str):
                data = json.loads(data)
            perf.start(self.__class__.__name__)
            if isinstance(data,dict) and len(data) > 0:
                t = data
                if 'id' in t:
                    perf.setUserID(t['id'])
            if isinstance(data,list) and len(data) > 1:
                perf.setData(data[1])
            if isinstance(data,list) and len(data) > 0:
                t = data[0]
                if 'id' in t:
                    perf.setUserID(t['id'])
            ret = self.execute(task['jobid'],data)
            perf.status(200)
        except Exception as e:
            print("ERROR:",str(e),str(data)[:100])
            jobstate.jobError()
            perf.status(501)
            raise e
        finally:
            perf.stop()
            perf.save()
        jobstate.jobComplete()
        if s3path is not None and not config.getKey("local_storage"):
            try:
                S3Processing.deleteS3ItemFromBucket(
                    config.getKey("request_bucket_access_key"),
                    config.getKey("request_bucket_access_secret"),
                    config.getKey("request_bucket"),
                    s3path
                )
            except:
                print("ERROR: Failed to delete item from bucket")
        elif 'data' not in data:
            try:
                os.unlink(s3path)
            except Exception:
                pass
        return ret
