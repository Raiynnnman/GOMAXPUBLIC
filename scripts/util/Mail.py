# coding=utf-8

import os
import datetime
import sys
import boto3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from common import settings, version
from util.Logging import Logging

config = settings.config()
config.read("settings.cfg")
log = Logging()

class Mail:

    def __init__(self):
        pass

    def defer(self,to,subject,template,data):
        sendEmail.delay(to,subject,template,data)

    def sendMail(self,to,subject,body,attach=None):
        if config.getKey("email_to_override") is not None:
            to = config.getKey("email_to_override")
        if config.getKey("no_email_send") is not None:
            return
        sender = "noreply@poundpain.com"
        access = config.getKey("email_user")
        secret = config.getKey("email_pass")
        client = boto3.client(
            'ses',region_name='us-east-1',
            aws_access_key_id=access, aws_secret_access_key=secret, use_ssl=True
        )
        sendRaw = False
        if attach is not None:
            sendRaw = True
            multipart_content_subtype = 'alternative' 
            msg = MIMEMultipart(multipart_content_subtype)
            msg['Subject'] = subject
            msg['From'] = sender
            msg.add_header('Content-Disposition', 'attachment', filename='invite.ics')
            msg['To'] = to
            mybody = MIMEText(body, 'html')
            msg.attach(mybody)
            mybody = MIMEText(body, 'plain')
            msg.attach(mybody)
            for attachment in attach or []:
                part = MIMEText(attachment['c'], attachment['t'])
                msg.attach(part)
            body = msg
        try:
            if not sendRaw:
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
            else:
                print(body.as_string())
                response = client.send_raw_email(
                    Destinations=[to],
                    RawMessage={'Data': body.as_string()},
                    Source=sender 
                )
        except Exception as e:
            log.error("Failed to send mail request to %s. Reason: %s" % (to,str(e)))
            return
        log.info("Successfully sent mail request to %s" % to)

    def send(self,to,subject,template,data):
        H=open(template,"r")
        body = H.read()
        H.close()
        for x in data:
            j = data[x]
            if j is None:
                j = ''
            body = body.replace(x,j)
        self.sendEmail(to,subject,body)

