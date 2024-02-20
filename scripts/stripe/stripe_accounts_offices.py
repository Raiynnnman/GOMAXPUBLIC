#!/usr/bin/python

import os
import sys
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")

key = config.getKey("stripe_key")
stripe.api_key = key

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
args = parser.parse_args()
db = Query()
l = db.query("""
        select
            o.id,name,active,stripe_connect_id,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id',oa.id,'addr1',addr1,'addr2',addr2,'phone',phone,
                    'city',city,'state',state,'zipcode',zipcode)
            ) as addr,ein_number
        from
            office o
        left outer join office_addresses oa on oa.office_id=o.id
        group by
            o.id
    """)

def createAccount(acc,btype):
    # Future, get this from db
    #H = open("stripe/stub_verification.jpg","rb")
    #ver_image = H.read()
    #H.close
    print(acc)
    # Stripe doesnt like formatted phone numbers
    phone = acc['addr'][0]['phone']
    phone = phone.replace("(","")
    phone = phone.replace(")","")
    phone = phone.replace(" ","")
    s_account = stripe.Account.create(
        type="custom",
        country="US",
        email="acc-%s-%s@directhealthdelivery.io" %(acc['id'],btype),
        business_type=btype,
        capabilities={
            'card_payments': {"requested":True},
            'transfers': {"requested":True},
            'us_bank_account_ach_payments':{"requested":True}
        },
        company = { 
            'name': acc['name'],
            'phone':phone,
            'tax_id':acc['ein_number'],
            'address': { 
                'city':acc['addr'][0]['city'],
                'country':'US',
                'line1': acc['addr'][0]['addr1'],
                'line2': acc['addr'][0]['addr2'],
                'postal_code': acc['addr'][0]['zipcode'],
                'state': acc['addr'][0]['state']
            },
            #'verification': { 
            #    'document': { 
            #        'front': ver_image
            #    }
            #}
        },
        metadata = { 
            'id': acc['id']
        } 
    )
    env = config.getKey("environment")
    if env == 'production':
        g = datetime.utcnow() - timedelta(days=1)
        stripe.Account.modify(
          acc['stripe_connect_id'],
          tos_acceptance={
            "date": g.strftime("%s"), 
            "ip": "8.8.8.8"
            }
        )
    db.update(""" 
        update office set stripe_connect_id=%s where id=%s
        """,(s_account['id'],acc['id'])
    )
    db.commit()

for x in l:
    x['addr'] = json.loads(x['addr'])
    if x['stripe_connect_id'] is None:
        try:
            createAccount(x,"company")
        except Exception as e:
            print("ERROR: Office %s has bad data. Reason: %s" % (x['id'],str(e)))

