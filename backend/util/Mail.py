import os
import sys
import boto3
import logging
from bs4 import BeautifulSoup
import threading
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from sendgrid.helpers.mail import *
import sendgrid
import traceback
from common import settings, version
from processing.run import app
from util.Logging import Logging

config = settings.config()
config.read("settings.cfg")
log = Logging()

@app.task(bind=True)
def sendEmail(self, *args):
    m = Mail()
    m.send_email(*args)

class Mail:

    def __init__(self):
        pass

   
    def defer(self, to, subject, template, data):
        try:
            self.defer_with_timeout(self.send_email, to, subject, template, data, timeout=10)
        except Exception as e:
            error_message = "Celery is down or task exceeded timeout."
            print(str(e))
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
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

    def sendEmailQueued(self,*args):
        sendEmail.delay(*args)


    def send_email_sendgrid(self, sender, to, subject,content):
        key = config.getKey("sendgrid_key")
        sg = sendgrid.SendGridAPIClient(api_key=key)
        soup = BeautifulSoup(content,features="html.parser")
        tcontent = soup.get_text()
        mail = sendgrid.helpers.mail.Mail(sender, to, subject, tcontent, content)
        resp = sg.client.mail.send.post(request_body=mail.get())

    def send_email_ses(self,sender, to,subject,content):
        client = boto3.client(
            'ses', region_name='us-east-1',
            aws_access_key_id=access, aws_secret_access_key=secret, use_ssl=True
        )
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

    def send_email(self, to, subject, template, data):
        if config.getKey("email_to_override") is not None:
            to = config.getKey("email_to_override")
        if config.getKey("no_email_send") is not None:
            return
        sender = config.getKey("email_from")
        if sender is None:
            sender = "noreply@gomaxpain.com"
        access = config.getKey("email_user")
        secret = config.getKey("email_pass")
        with open(template, "rb") as H:
            body = H.read().decode('utf-8',errors='ignore')
        for x in data:
            body = body.replace(x, str(data[x]))
        try:
            self.send_email_sendgrid(sender, to,subject,body)
        except Exception as e:
            log.error(f"Failed to send mail request to {to}. Reason: {str(e)}")
            return
        log.info(f"Successfully sent mail request to {to}")

