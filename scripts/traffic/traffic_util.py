
import os
import sys
import math
import time
import json
sys.path.append(os.getcwd())  # noqa: E402
from util.DBOps import Query
from common import settings
from util import encryption,calcdate,getIDs


def importTraffic(db,JS,city,state,zipcode,lat,lon):
    NEW=0
    TC=getIDs.getTrafficCategories()
    SKIP=0
    for z in JS['incidents']:
        # print(json.dumps(z,indent=4))
        # print("---")
        # print(json.dumps(x,indent=4))
        uuid = encryption.getSHA256()
        incid = 0
        HAVE=False
        props = z['properties']
        # print(json.dumps(props,indent=4))
        l = db.query("""
            select id from traffic_incidents where vendor_id = %s
            """,(props['id'],)
        )
        for h in l:
            HAVE=True
        if HAVE:
            # print("already loaded incident %s" % props['id'])
            SKIP += 1
            continue
        NEW += 1
        cat = TC[props['iconCategory']]
        db.update("""
            insert into traffic_incidents (
                uuid,traf_delay,traf_end_time,traf_from,
                traffic_categories_id,vendor_id,traf_len,
                traf_magnitude,traf_num_reports,probability,
                traf_start_time,traf_to,city,state,zipcode,
                lat,lon
            ) values (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,%s
            )
        """,(
            uuid,props['delay'],props['endTime'],props['from'],
            cat,props['id'],props['length'],
            props['magnitudeOfDelay'],
            props['numberOfReports'] if props['numberOfReports'] is not None else 0,
            props['probabilityOfOccurrence'], props['startTime'],
            props['to'],
            city,state,zipcode,lat,lon
        ))
        l = db.query("""
            select LAST_INSERT_ID()
            """)
        incid = l[0]['LAST_INSERT_ID()']
        order = 0
        for t in z['geometry']['coordinates']:
            db.update("""
               insert into traffic_coordinates (
                traffic_incidents_id,lon,lat,ord ) values (
                    %s,%s,%s,%s
                )
            """,(incid,t[0],t[1],order))
            order += 1
    db.commit()   
    print("Added %s, skipped %s" % (NEW, SKIP))
