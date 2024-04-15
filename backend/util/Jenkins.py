import os
import sys
import boto3

from common import settings, version
from processing.run import app
from util.Logging import Logging

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
        print(args,kwargs)
