# coding=utf-8

import sys
import os
import json
import unittest
import base64
import stripe
import mimetypes

from util import encryption
from util import S3Processing
from util.Logging import Logging
from util.Mail import Mail
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

class Stripe():

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def setupCard(self,arr,user_id):
        if 'token' not in arr:
            raise Exception('TOKEN_REQUIRED')
        token = arr['token']

    def setupIntent(self,arr,cust_id,user_id):
        stripe.api_key = config.getKey("stripe_key")
        r = stripe.SetupIntent.create(
            customer=cust_id,
            confirm=False,
            payment_method_types=["card"],
            metadata={'user_id':user_id}
        )
        d = {
            'id': r['id'],
            'client_secret': r['client_secret']
        }
        return d

    def getStripeID(self,user_id):
        ret = None
        db = Query()
        o = db.query("select id,stripe_customer_id from users where id=%s",(user_id,))
        if len(o) > 0:
            ret = o[0]['stripe_customer_id']
        return ret

    def confirmCard(self,params,user_id,stripe_id):
        card = None
        token = None
        intent_id = None
        if 'card' in params:
            card = params['card']
        if 'token' in params:
            token = params['token']
        if 'intent_id' in params:
            intent_id = params['intent_id']
        stripe.api_key = config.getKey("stripe_key")
        r = stripe.SetupIntent.confirm(
            params['intentid'],
            payment_method="pm_card_visa"
        )
        return r
        
    def createCustomer(self,arr,user_id):
        db = Query()
        d = {}
        stripe.api_key = config.getKey("stripe_key")
        o = db.query("""
            select id,email,first_name,last_name,phone from users where id=%s
            """,(user_id,))
        d = o[0]
        d['name'] = d['first_name'] + " " + d['last_name']
        del d['id']
        del d['first_name']
        del d['last_name']
        r = stripe.Customer.create(
            description="User %s" % d['email'].lower(),
            email=d['email'].lower(),
            metadata={'user_id':user_id},
            phone=d['phone'],
            name=d['name']
        )
        db.update("update users set updated=now(),stripe_customer_id=%s where id=%s",
            (r['id'],user_id)
        )
        db.commit()
        return r['id']
