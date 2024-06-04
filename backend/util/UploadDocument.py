# coding=utf-8

import sys
import os
import json
import unittest
import jwt
import base64
import mimetypes
import dateutil 

from util import encryption,calcdate
from util import S3Processing
from processing import Stripe
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from processing.Profile import Profile
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials

log = Logging()
config = settings.config()
config.read("settings.cfg")


def uploadDocument(office_id,user_id,uueid,content,desc):
    ret = {}
    db = Query()
    f = content.split(';')
    content = f[1]
    mime = f[0]
    mime = mime.replace('data:','')
    content = content.replace('base64,','')
    fname = encryption.getSHA256(content)
    content = encryption.encrypt(content,config.getKey('encryption_key'))
    ext = mimetypes.guess_extension(mime)
    s3path = "documents/user/%s/%s/%s%s" % (
        office_id,user_id,fname,ext
    )
    S3Processing.uploadItemToS3Deferred(
        config.getKey("request_bucket_access_key"),
        config.getKey("request_bucket_access_secret"),
        config.getKey("request_bucket"),
        s3path,
        mime,
        content)
    db.update("""
        insert into user_upload_documents 
            (user_upload_email_id,blob_path,description,mimetype) values (
            %s,%s,%s,%s
        )
    """,(uueid,s3path,desc,mime)
    )
    db.commit()
    insid = db.query("select LAST_INSERT_ID()");
    insid = insid[0]['LAST_INSERT_ID()']
    ret['success'] = True
    ret['insid'] = insid
    return ret

def uploadDocumentOffice(office_id,invoices_id,content,desc):
    ret = {}
    db = Query()
    f = content.split(';')
    content = f[1]
    mime = f[0]
    mime = mime.replace('data:','')
    content = content.replace('base64,','')
    fname = encryption.getSHA256(content)
    content = encryption.encrypt(content,config.getKey('encryption_key'))
    ext = mimetypes.guess_extension(mime)
    s3path = "documents/user/%s/%s/%s%s" % (
        office_id,invoices_id,fname,ext
    )
    S3Processing.uploadItemToS3Deferred(
        config.getKey("request_bucket_access_key"),
        config.getKey("request_bucket_access_secret"),
        config.getKey("request_bucket"),
        s3path,
        mime,
        content)
    db.update("""
    insert into office_invoice_upload_documents (
        office_id,invoices_id,mimetype,description,blob_path)
    values (%s,%s,%s,%s,%s)
    """,(office_id,invoices_id,mime,desc,s3path)
    )
    db.commit()
    insid = db.query("select LAST_INSERT_ID()");
    insid = insid[0]['LAST_INSERT_ID()']
    ret['success'] = True
    ret['insid'] = insid
    return ret





