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

from util.DBOps import Query
from common import settings
from util import encryption,calcdate,S3Processing
from util import getIDs
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
        i.id as invoices_id, o.id as office_id, o.name,
        sis.stripe_invoice_number,from_unixtime(sis.paid_at) as stripe_date,
        json_arrayagg(
            json_object(
                'id',ii.id,'code',ii.code,
                'assigned',ii.user_id,
                'desc',ii.description,
                'price', round(ii.price,2),
                'quantity', ii.quantity,
                'office_id', ii.office_id,
                'phy_total', round(ii.phy_total,2),
                'dhd_total', round(ii.dhd_total,2)
            )
        ) as items
    from
        invoices i, invoice_items ii,
        physician_schedule_scheduled pss,
        office o,stripe_invoice_status sis
    where 
        i.id = ii.invoices_id and
        sis.invoices_id = i.id and
        o.id = i.office_id and
        i.physician_schedule_id = pss.physician_schedule_id and
        pss.appt_status_id=%s and 
        i.invoice_status_id=%s and 
        i.id not in (select invoices_id from office_fee_items) and 
        i.id in (select invoices_id from office_invoice_upload_documents where isreceipt=1)
    group by
        i.id
    
    """,(APPT['APPOINTMENT_COMPLETED'],INV['PAID'])
)

for x in o:
    if x['office_id'] is None:
        continue
    x['items'] = json.loads(x['items'])
    H = open("templates/invoice/invoice.html","r")
    html = H.read()
    H.close()
    addres = db.query("""
        select addr1,addr2,phone,city,state,zipcode from office_addresses where office_id=%s
        """,(x['office_id'],)
    )
    total = 0
    newitems = []
    tdate = x['stripe_date']
    tdate = calcdate.parseDate(tdate)
    OFFICES={}
    INV={}
    for g in x['items']:
        t = g['phy_total']
        g['price'] = "{:.2f}".format(t)
        g['total'] = "{:.2f}".format(t)
        if g['assigned'] not in OFFICES:
            OFFICES[g['assigned']] = {
                'total':0,
                'office_id': g['office_id'],
                'items':[]
            }
        OFFICES[g['assigned']]['items'].append(g)
        OFFICES[g['assigned']]['total'] += t
        if not args.dryrun:
            db.update("""insert into office_fee_items 
                (user_id,invoices_id,description,price,code,quantity,office_id) values
                (%s,%s,%s,%s,%s,%s,%s)
                """,(
                    g['assigned'],x['invoices_id'],g['desc'],g['price'],g['code'],g['quantity'],g['office_id']
                )
            )
    db.commit()

    for g in OFFICES:
        print(OFFICES[g])
        off = db.query("""
            select
                o.name,u.title,u.first_name,u.last_name,u.email,
                json_arrayagg(
                    json_object(
                        'addr1',oa.addr1,'addr2',oa.addr2,
                        'city', oa.city, 'state', oa.state,
                        'zipcode',oa.zipcode
                    )
                ) as addr
            from
                office o, office_user ou,
                office_addresses oa, users u
            where
                ou.office_id = o.id and 
                ou.user_id = u.id and
                oa.office_id = o.id and
                o.id=%s
            """,(OFFICES[g]['office_id'],)
        )
        if off[0]['name'] is None:
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(x['invoices_id'],1,'Failed to generate payout, address missing' )
            )
            db.commit()
            print("Missing addresses for %s, skipping" % g)
            continue
        name = off[0]['name']
        addr = json.loads(off[0]['addr'])
        newitems = OFFICES[g]['items']
        if g not in INV:
            data = { 
                'name': name, 
                'physician': "%s %s %s" % (off[0]['title'],off[0]['first_name'],off[0]['last_name']),
                'stripe_invoice_number':x['stripe_invoice_number'],
                'stripe_date': tdate.strftime('%B %d, %Y'),
                'total': OFFICES[g]['total'],
                'addr': addr[0],
                'office_id': OFFICES[g]['office_id'],
                'items': newitems
            } 
            INV[g] = data
        else:
            INV[g]['items'] = INV[g]['items'].update(newitems)

    for g in INV:
        data = INV[g]
        data['total']: "{:.2f}".format(data['total'])
        j2_template = Template(html)
        fin = j2_template.render(data)
        fname = "transfer-%s-%s-%s.pdf" % (
            str(x['invoices_id']).rjust(10,'0'),
            str(data['office_id']).rjust(10,'0'),
            str(g).rjust(10,'0')
        )
        pdfkit.from_string(fin,fname)
        H = open(fname,"rb")
        content = H.read()
        H.close()
        if not args.dryrun:
            b = base64.b64encode(content)
            b = encryption.encrypt(b.decode('utf-8'),config.getKey("encryption_key"))
            path = "documents/office/%s/transfer/%s/%s.enc" % (data['office_id'],x['invoices_id'],fname)
            S3Processing.uploadS3ItemToBucket(aws_user,aws_pass,bucket,path,"application/pdf",b)
            db.update("""
                insert into office_invoice_upload_documents 
                    (description,office_id,invoices_id,mimetype,blob_path) values 
                    (%s,%s,%s,%s,%s)
                """,('Notice of transfer of funds',data['office_id'],x['invoices_id'],"application/pdf",path)
            )
            db.update("""
                insert into invoice_history (invoices_id,user_id,text) values 
                    (%s,%s,%s)
                """,(x['invoices_id'],1,'Generated transfer item for Office %s' %  data['office_id'])
            )
            db.commit()
        if not args.dryrun:
            os.unlink(fname)

    

