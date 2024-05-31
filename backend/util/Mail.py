import os
import sys
import boto3
import logging
import threading
from concurrent.futures import ThreadPoolExecutor, TimeoutError

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

   
    def defer(self, to, subject, template, data):
        print("We made it to the mail")
        try:
            self.defer_with_timeout(self.send_email, to, subject, template, data, timeout=10)
            print("we completed mail")
        except Exception as e:
            error_message = "Celery is down or task exceeded timeout."
            print(error_message)
            log.error(f"Failed to defer email task. Reason: {str(e)}")
            log.error(error_message)
            log.error(f"Original recipient: {to}, Subject: {subject}, Template: {template}, Data: {data}")

    def defer_with_timeout(self, func, *args, timeout):
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(func, *args)
            try:
                future.result(timeout=timeout)
            except TimeoutError:
                raise TimeoutError("Task exceeded timeout")

    def send_email(self, to, subject, template, data):
        if config.getKey("email_to_override") is not None:
            to = config.getKey("email_to_override")
        if config.getKey("no_email_send") is not None:
            return
        sender = "noreply@poundpain.com"
        access = config.getKey("email_user")
        secret = config.getKey("email_pass")
        with open(template, "r") as H:
            body = H.read()
        for x in data:
            body = body.replace(x, data[x])
        client = boto3.client(
            'ses', region_name='us-east-1',
            aws_access_key_id=access, aws_secret_access_key=secret, use_ssl=True
        )
        try:
            response = client.send_email(
                Destination={'ToAddresses': [to]},
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
            log.error(f"Failed to send mail request to {to}. Reason: {str(e)}")
            return
        log.info(f"Successfully sent mail request to {to}")

