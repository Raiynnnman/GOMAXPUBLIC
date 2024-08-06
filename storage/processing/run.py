# coding=utf-8

import sys
import os
from celery import Celery
from kombu.utils.url import safequote
from common import settings
from util import calcdate


sys.path.append(os.path.realpath(os.curdir))

config = settings.config()
config.read("settings.cfg")

cel_user = config.getKey("celery_queue_user")
cel_pass = config.getKey("celery_queue_pass")

if cel_user is None or cel_pass is None:
    cel_user = "noone"
    cel_pass = "nopass"

cel_user = safequote(cel_user.encode('utf-8'))
cel_pass = safequote(cel_pass.encode('utf-8'))

celery_prefix = "dev-%s-queue" % os.getenv('USER')

if config.getKey("celery_queue_prefix") is not None:
    celery_prefix = config.getKey("celery_queue_prefix")

broker_url = None
if config.getKey("use_sqsbackend") is not None:
    broker_url = 'sqs://%s:%s@' % (
        cel_user, cel_pass    
    )
elif config.getKey("use_esbackend"):
    broker_url = "elasticsearch://%s/%s/_doc" % (
        config.getKey("es_server"),
        celery_prefix)
        
else:
    broker_url = config.getKey("broker_url")

backend = config.getKey("backend_url")
if 'elasticsearch' in backend:
    O=calcdate.getTimestampUTCMonth()
    backend = "%squeueevalresults-%s/%s" % (backend, O, "_doc")

F=open(".queue", "wb")
F.write(("%s" % celery_prefix).encode('utf-8'))
F.close()

CELERY_ACCEPT_CONTENT = ['json']
app = Celery('sbqueue',
             broker=broker_url,
             backend=backend
)

app.conf.update(
    task_default_queue=celery_prefix,
    task_serializer='json',
    broker_heartbeat_checkrate=2.0,
    broker_heartbeat=10,
    accept_content=['json'],  # Ignore other content
    result_serializer='json',
    enable_utc=True,
    broker_transport_options = {
        'visibility_timeout': 600,
        'polling_interval': 0.5,
    }
)

if __name__ == '__main__':
    app.start()
