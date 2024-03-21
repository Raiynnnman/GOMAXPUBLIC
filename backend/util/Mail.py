# coding=utf-8

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
def sendEmail(self, *args):
    m = Mail()
    m.send(*args)

class Mail:

    def __init__(self):
        pass

    def defer(self,to,subject,template,data):
        sendEmail.delay(to,subject,template,data)

    def send(self,to,subject,template,data):
        if config.getKey("email_to_override") is not None:
            to = config.getKey("email_to_override")
        if config.getKey("no_email_send") is not None:
            return
        sender = "noreply@poundpain.com"
        access = config.getKey("email_user")
        secret = config.getKey("email_pass")
        H=open(template,"r")
        body = H.read()
        H.close()
        client = boto3.client(
            'ses',region_name='us-east-1',
            aws_access_key_id=access, aws_secret_access_key=secret, use_ssl=True
        )
        for x in data:
            body = body.replace(x,data[x])
        try:
            response = client.send_email(
                Destination={'ToAddresses':[to]},
                Message={
                    'Body': { 
                        'Html': {
                            'Data': body
                        },
                        'Text': { 
                            'Data': body
                        }
                    },
                    'Subject': { 
                        'Data': subject
                    }
                },
                Source=sender 
            )
        except Exception as e:
            log.error("Failed to send mail request to %s. Reason: %s" % (to,str(e)))
            return
        log.info("Successfully sent mail request to %s" % to)
        
