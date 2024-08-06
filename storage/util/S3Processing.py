# coding=utf-8

import sys
import boto3
import json
import os
from common import settings
from processing.run import app

config = settings.config()
config.read('settings.cfg')

@app.task(bind=True)
def uploadItemToS3Deferred(self, *args):
    uploadS3ItemToBucket(*args)

def uploadS3ItemToBucketDefault(path, mime, data):
    return uploadS3ItemToBucket(
        config.getKey("request_bucket_access_key"),
        config.getKey("request_bucket_access_secret"),
        config.getKey("request_bucket"),
        path, 
        mime,
        data)

def downloadS3ItemToBucketDefault(path):
    return downloadS3ItemToBucket(
        config.getKey("request_bucket_access_key"),
        config.getKey("request_bucket_access_secret"),
        config.getKey("request_bucket"),
        path, 
        data)

def deleteS3ItemToBucketDefault(path):
    return deleteS3ItemToBucket(
        config.getKey("request_bucket_access_key"),
        config.getKey("request_bucket_access_secret"),
        config.getKey("request_bucket"),
        path, 
        data)

def uploadS3ItemToBucket(access, secret, bucket, path, mime, data):
    if config.getKey("local_storage") is not None:
        d = "./tmp"
        f = "%s/%s" % (d,path)
        g = os.path.dirname(f)
        if not os.path.exists(g):
            os.makedirs(g)
        H = open(f, "wb")
        if isinstance(data,list):
            H.write(json.dumps(data).encode('utf-8'))
        elif isinstance(data,bytes):
            H.write(data)
        else:
            H.write(data.encode('utf-8'))
        H.close()
        return
    if access is None:
        raise Exception("INVALID_ACCESS_KEY")
    if secret is None:
        raise Exception("INVALID_SECRET_KEY")
    s3 = boto3.resource(
        's3', aws_access_key_id=access,
        aws_secret_access_key=secret, use_ssl=True)
    obj = s3.Object(bucket, path)
    obj.put(Body=data,ContentType=mime)

def downloadS3ItemFromBucket(access, secret, bucket, path):
    if config.getKey("local_storage") is not None:
        d = "./tmp"
        f = "%s/%s" % (d,path)
        H = open(f, "rb")
        T = H.read()
        return T.decode('UTF-8')
    if access is None:
        raise Exception("INVALID_ACCESS_KEY")
    if secret is None:
        raise Exception("INVALID_SECRET_KEY")
    s3 = boto3.client(
        's3', aws_access_key_id=access,
        aws_secret_access_key=secret, use_ssl=True)
    obj = s3.get_object(Bucket=bucket, Key=path)
    r = obj['Body'].read()
    return r

def deleteS3ItemFromBucket(access, secret, bucket, path):
    if access is None:
        raise Exception("INVALID_ACCESS_KEY")
    if secret is None:
        raise Exception("INVALID_SECRET_KEY")
    s3 = boto3.resource(
        's3', aws_access_key_id=access,
        aws_secret_access_key=secret, use_ssl=True)
    s3.Object(bucket, path).delete()
