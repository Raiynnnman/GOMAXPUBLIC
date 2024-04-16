import os
import sys
import boto3

from common import settings, version
from processing.run import app
from util.Logging import Logging
from util.DBOps import Query

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
        cls = args[1][0]
        print(cls)
        db = Query()
        ret = {}
        
        o = db.query("select job from jenkins_jobs where class=%s",(cls,))
        if len(o) < 1:
            print("Jenkins: Nothing to do")
            return
        env =  config.getKey("environment")
        url =  config.getKey("jenkins_url")
        user = config.getKey("jenkins_user")
        pasw = config.getKey("jenkins_pass")
        print(env,url,user,pasw)
        if env is None or url is None or user is None or pasw is None:
            print("Values missing to run jenkins")
            return
        jenk = None
        try:
            jenk = jenkins.Jenkins(url,username=user,password=pasw)
        except Exception as e:
            print(str(e))
        if not jenk:
            return
        for x in o:
            print(x['job'])



