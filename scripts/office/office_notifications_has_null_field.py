#!/usr/bin/python

import os
import sys
import json
from datetime import datetime

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import getIDs
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
    oa.addr1 IS NULL or oa.city IS NULL or oa.zipcode IS NULL or oa.state is NULL
"""
if not args.force:
    q += " AND (oa.nextcheck IS NULL OR oa.nextcheck < NOW())"

offices = db.query(q)
CNT = 0

for office in offices:
    if notify_if_not_exists(db, office['office_id'], OFN['OFFICE_NOTIFICATION_DELETE_INVALID_ADDRESS']):
        continue
    
    office_id = office['id']
    
    # Delete dependent rows in office_providers
    delete_providers_query = "DELETE FROM office_providers WHERE office_addresses_id = %s"
    db.update(delete_providers_query, (office_id,))
    
    # Delete the row from office_addresses
    delete_addresses_query = "DELETE FROM office_addresses WHERE id = %s"
    db.update(delete_addresses_query, (office_id,))
    
    CNT += 1

db.commit()
print("Deleted %s records" % CNT)
