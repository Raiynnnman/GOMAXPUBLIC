#!/usr/bin/python

import os
import sys
from datetime import datetime, timedelta
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
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

APT = getIDs.getAppointStatus()
INV = getIDs.getInvoiceIDs()
db = Query()
q = db.query("""
    select
        ab.id,pss.physician_schedule_id,u.id as user_id,
        b.name as bundle_name,u.first_name as uname,u.email,
        u.last_name,u.stripe_customer_id,ps.id as appt_id,
        o.name as office_name,o.id as office_id,b.id as bundle_id,
        json_arrayagg(
            json_object(
                'id',bi.id,'code',bi.code,
                'assigned',bi.user_id,
                'desc',bi.description,
                'office_id', bi.office_id,
                'price', round(bi.price,2),
                'quantity', bi.quantity
            )
        ) as items,o.dhd_markup,b.markup
    from 
        appt_bundle ab,bundle_items bi,
        physician_schedule_scheduled pss,
        physician_schedule ps,
        bundle b,users u,office o,office_user ou
    where
        ps.id = pss.physician_schedule_id and
        ou.user_id = ps.user_id and 
        o.id = ou.office_id and
        o.id = pss.office_id and
        pss.user_id = u.id and 
        b.id=bi.bundle_id and 
        ab.physician_schedule_scheduled_id = pss.physician_schedule_id and
        bi.bundle_id=ab.bundle_id and
        pss.appt_status_id = %s 
    group by 
        pss.physician_schedule_id
    """,(APT['APPOINTMENT_SCHEDULED'],)
)

for x in q:
    print("Processing invoice for %s" % x['appt_id'])
    x['items'] = json.loads(x['items'])
    insid = 0
    o = db.query("""
        select id from invoices where 
            physician_schedule_id = %s
        """,(x['appt_id'],)
    )
    if len(o) > 0:
        insid=o[0]['id']
        # Something went wrong, regenerate
        db.update("delete from stripe_invoice_status where invoices_id = %s",(insid,))
        db.commit()
        db.update("delete from invoice_items where invoices_id = %s",(insid,))
        db.commit()
        db.update("delete from invoice_history where invoices_id = %s",(insid,))
        db.commit()
        db.update("delete from invoices_comment where invoices_id = %s",(insid,))
        db.commit()
        db.update("delete from invoices where id = %s",(insid,))
        db.commit()
    db.update("""
    insert into invoices(office_id,user_id,physician_schedule_id,bundle_id,invoice_status_id) values
        (%s,%s,%s,%s,%s)
        """,(x['office_id'],x['user_id'],x['appt_id'],x['bundle_id'],INV['CREATED'])
    )
    db.commit()
    insid = db.query("select LAST_INSERT_ID()")
    insid = insid[0]['LAST_INSERT_ID()']
    all_dhd_total = 0
    all_phy_total = 0
    all_pat_total = 0
    for g in x['items']:
        print(g)
        subtotal = g['price']*g['quantity']
        dhd_total = round(subtotal*(x['dhd_markup']-1),2)
        phy_total = round(subtotal*x['markup'],2)
        all_dhd_total += dhd_total
        all_phy_total += phy_total
        price = round(g['price']*g['quantity']*x['markup']*x['dhd_markup'],2)
        all_pat_total += price
        db.update("""
            insert into invoice_items (
                    invoices_id,description,price,quantity,code,user_id,office_id,
                    phy_total,dhd_total
                ) values (
                %s,%s,%s,%s,%s,%s,%s,%s,%s
            )
            """,(
                insid,g['desc'],price,g['quantity'],g['code'],g['assigned'],g['office_id'],
                phy_total,dhd_total
            )
        )
    db.update("""
        update invoices set patient_total=%s,dhd_total=%s,phy_total=%s where id=%s
        """,(all_pat_total,all_dhd_total,all_phy_total,insid)
    )
    db.update("""
        insert into stripe_invoice_status (office_id,invoices_id,status) values (%s,%s,%s)
        """,(x['office_id'],insid,'draft')
    )
    db.update("""
        update physician_schedule_scheduled set appt_status_id=%s where physician_schedule_id = %s
        """,(APT['INVOICE_GENERATED'],x['appt_id'])
    )
    db.update("""
        insert into invoice_history (invoices_id,user_id,text) values 
            (%s,%s,%s)
        """,(insid,1,'Generated invoice' )
    )
    db.commit()
    
