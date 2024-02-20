#!/usr/bin/python

import os
import sys
import base64
import pdfkit
from datetime import datetime, timedelta
import time
from jinja2 import Template
import json

sys.path.append(os.getcwd())  # noqa: E402

from util import getIDs
from util.DBOps import Query
from common import settings
from util import encryption,calcdate,S3Processing
import argparse
import stripe
config = settings.config()
config.read("settings.cfg")

key = config.getKey("stripe_key")
stripe.api_key = key
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
args = parser.parse_args()

bucket = config.getKey("document_bucket")
aws_user = config.getKey("document_bucket_access_key")
aws_pass = config.getKey("document_bucket_access_secret")

db = Query()
INV = getIDs.getInvoiceIDs()
APPT = getIDs.getAppointStatus()

o = db.query("""
    select 
        c.user_id,c.fee,first_name,last_name,i.id as invoices_id,
        sis.stripe_invoice_number,from_unixtime(sis.paid_at) as stripe_date,
        pss.physician_schedule_id as appt_id
    from
        consultant c, invoices i, stripe_invoice_status sis,
        consultant_schedule cs, users u,
        consultant_schedule_scheduled css, 
        physician_schedule_scheduled pss
    where
        i.id = sis.invoices_id and
        cs.user_id = u.id and
        cs.id = css.consultant_schedule_id and
        i.physician_schedule_id = css.physician_schedule_id and
        css.physician_schedule_id = pss.physician_schedule_id and
        cs.user_id = c.user_id and
        i.id not in (select invoices_id from consultant_invoice_upload_documents) and
        i.id in (select invoices_id from office_invoice_upload_documents where isreceipt=1) and
        pss.appt_status_id = %s
    """,(APPT['APPOINTMENT_COMPLETED'],)
)

for x in o:
    if x['user_id'] is None:
        continue
    addres = db.query("""
        select 
            c.addr1,c.addr2,c.phone,c.city,c.state,c.zipcode,
            first_name,last_name
        from 
            consultant c, users u
        where 
            c.user_id = u.id and
            c.user_id=%s
        """,(x['user_id'],)
    )
    total = x['fee']
    newitems = []
    items = [{
        'price': "{:.2f}".format(x['fee']),
        'quantity': 1,
        'code': 'N/A',
        'desc': "Consulting Srvcs for Appt %s" % x['appt_id'],
        'total': "{:.2f}".format(x['fee']),
    }]
    g = items[0]
    if not args.dryrun:
        db.update("""insert into consultant_fee_items 
            (invoices_id,description,price,code,quantity,consultant_user_id) values
                (%s,%s,%s,%s,%s,%s);
            """,(
                x['invoices_id'],g['desc'],g['price'],g['code'],g['quantity'],x['user_id']
            )
        )
    tdate = x['stripe_date']
    tdate = calcdate.parseDate(tdate)
    data = { 
        'name': x['first_name'] + " " + x['last_name'],
        'stripe_invoice_number':x['stripe_invoice_number'],
        'stripe_date': tdate.strftime('%B %d, %Y'),
        'addr': addres[0],
        'total': "{:.2f}".format(total),
        'items': items
    } 
    H = open("templates/invoice/invoice.html","r")
    html = H.read()
    H.close()
    j2_template = Template(html)
    fin = j2_template.render(data)
    fname = "transfer-%s-%s.pdf" % (
            str(x['invoices_id']).rjust(10,'0'),
            str(x['user_id']).rjust(10,'0')
        )
    pdfkit.from_string(fin,fname)
    H = open(fname,"rb")
    content = H.read()
    H.close()
    if not args.dryrun:
        b = base64.b64encode(content)
        b = encryption.encrypt(b.decode('utf-8'),config.getKey("encryption_key"))
        path = "documents/consultant/%s/transfer/%s/%s.enc" % (x['user_id'],x['invoices_id'],fname)
        S3Processing.uploadS3ItemToBucket(aws_user,aws_pass,bucket,path,"application/pdf",b)
        db.update("""
            insert into consultant_invoice_upload_documents 
                (description,consultant_user_id,invoices_id,mimetype,blob_path) values 
                (%s,%s,%s,%s,%s)
            """,('Notice of transfer of funds',x['user_id'],x['invoices_id'],"application/pdf",path)
        )
        db.update("""
            insert into invoice_history (invoices_id,user_id,text) values 
                (%s,%s,%s)
            """,(x['invoices_id'],1,'Generated consultant fee documents')
        )
        db.commit()
        # os.unlink(fname)
