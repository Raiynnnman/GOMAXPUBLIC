#!/usr/bin/python

import os
import sys
import json
from datetime import datetime

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption, calcdate, getIDs
from util.notifyExists import notify_if_not_exists
import argparse
import requests
from util.DBOps import Query

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--force', dest="force", action="store_true")
args = parser.parse_args()

OFN = getIDs.getOfficeNotificationCategories()
db = Query()

# Updated query to select office addresses with missing or invalid addresses
q = """
    SELECT 
            oa.id, oa.zipcode, oa.state,
            oa.city, oa.addr1, o.office_type_id,
            oa.lat, oa.lon, o.id AS office_id
        FROM 
            office_addresses oa
        LEFT JOIN office o ON oa.office_id = o.id
        WHERE
            oa.addr1 IS NOT NULL AND LENGTH(oa.addr1)  <= 1
"""

if not args.force:
    q += " AND (oa.nextcheck IS NULL OR oa.nextcheck < NOW()) "

offices = db.query(q)
CNT = 0

for office in offices:
    # Since the query already filters for NULL or empty addr1, no need for extra check
    if notify_if_not_exists(db, office['office_id'], OFN['OFFICE_NOTIFICATION_NO_ADDRESS']):
        continue
    
    # Insert notification for offices without a valid address
    db.update("""
        INSERT INTO office_notifications (office_id, office_notifications_category_id, notifiable_id, notifiable_type, acknowledged) 
        VALUES (%s, %s, %s, 'office', 0)
    """, (office['office_id'], OFN['OFFICE_NOTIFICATION_NO_ADDRESS'], office['office_id']))
    db.commit()
    
    CNT += 1

print("Updated %s records" % CNT)
