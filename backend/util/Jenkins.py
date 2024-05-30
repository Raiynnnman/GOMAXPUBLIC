import os
import sys
import boto3

from common import settings, version
from processing.run import app
from util.Logging import Logging
from util.DBOps import Query
import jenkins

config = settings.config()
config.read("settings.cfg")
log = Logging()

@app.task(bind=True)
def spawnJob(self, *args,**kwargs):
    m = Jenkins()
    m.process(args,kwargs)

class Jenkins:
    def __init__(self):
        pass

    def process(*args,**kwargs):
        return 
        cls = args[1][0]
        myid = ''
        if len(args[1]) > 1:
            myid = args[1][1]
        db = Query()
        
        o = db.query("select job from jenkins_jobs where class=%s",(cls,))
        if len(o) < 1:
            # print("Jenkins: Nothing to do")
            return
        print("vals=%s,%s" % (cls,myid))
        env =  config.getKey("environment")
        url =  config.getKey("jenkins_url")
        user = config.getKey("jenkins_user")
        pasw = config.getKey("jenkins_pass")
        # print(env,url,user,pasw)
        if env is None or url is None or user is None or pasw is None:
            print("Values missing to run jenkins")
            return
        jenk = None
        try:
            jenk = jenkins.Jenkins(url,username=user,password=pasw)
        except Exception as e:
            print("CONNECT: Connecting job: %s" % str(e))
        if not jenk:
            return
        for x in o:
            job = "%s-backend-processing/%s-%s" % (env,env,x['job'])
            print(job)
            try:
                # jobs = jenk.get_jobs()
                # print(jobs)
                jenk.build_job(job,{'ID':myid})
            except Exception as e:
                print("RUN: Running job (%s): %s" % (job,str(e)))



