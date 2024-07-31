# coding=utf-8

import boto3
import json
import os
from common import settings

config = settings.config()
config.read('settings.cfg')


def uploadS3ItemToBucketDefault(path, data):
    return uploadS3ItemToBucket(
        config.getKey("request_bucket_access_key"),
        config.getKey("request_bucket_access_secret"),
        config.getKey("request_bucket"),
        path, 
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

def uploadS3ItemToBucket(access, secret, bucket, path, data):
    if config.getKey("local_storage") is not None:
        d = "./tmp"
        f = "%s/%s" % (d,path)
        g = os.path.dirname(f)
        if not os.path.exists(g):
            os.makedirs(g)
        H = open(f, "wb")
        H.write(data.encode('UTF-8'))
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
    obj.put(Body=data)

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
    if isinstance(r, str):
        r = json.loads(r)
    if isinstance(r, bytes):
        r = json.loads(r.decode('utf-8'))
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
