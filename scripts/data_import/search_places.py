#!/usr/bin/python

import os
import random
from urllib.parse import urlparse
import sys
from datetime import datetime, timedelta
import time
import simplejson as json
from googleplaces import GooglePlaces, types, lang

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
import pandas as pd
from common import settings
from util import encryption,calcdate
from util import getIDs

import argparse

DAY_MAPPING = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
}

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--office', dest="office", action="store")
parser.add_argument('--zipcode', dest="zipcode", action="store")
args = parser.parse_args()

gp = GooglePlaces(config.getKey("google_api_key"))

db = Query()

STR = getIDs.getLeadStrength()
OT = getIDs.getOfficeTypes()
PLACES = {}

def processLocation(q,dedup=False):
    global db
    global PLACES
    FINAL = {}
    if 'health' not in q['types']:
        # print("not health")
        return None
    if q['business_status'] != "OPERATIONAL":
        # print("not operational")
        return None
    pid = q['place_id']
    FINAL['places_id'] = pid
    has = db.query("""
        select id from office_potential_places where places_id=%s
        UNION ALL
        select id from provider_queue where places_id=%s
        UNION ALL
        select id from office where places_id=%s
    """,(pid,pid,pid))
    if len(has) > 0:
        print("Already have %s" % pid)
        return None
    if pid in PLACES:
        print("Already did %s" % pid)
        return None
    PLACES[pid] = 1
    gtok = q['formatted_address'].split(' ')
    score = 0
    # print("q=%s" % json.dumps(q,indent=4))
    if 'formatted_phone_number' not in q:
        # print("business has no phone")
        return None
    gphone = q['formatted_phone_number']
    gphone = gphone.replace(" ",'').replace("-",'').replace(")","").replace("(",'')
    ophone = ''
    FINAL['phone'] = gphone
    if 'website' in q:
        gweb = q['website']
        FINAL['website'] = gweb
    addr = city = state = zipcode = ''
    for hh in q['address_components']:
        if 'street_number' in hh['types']:
            addr += hh['long_name']
        if 'route' in hh['types']:
            addr += " " + hh['long_name']
        if 'locality' in hh['types']:
            city = hh['long_name']
        if 'administrative_area_level_1' in hh['types']:
            state = hh['long_name']
        if 'postal_code' in hh['types']:
            zipcode = hh['long_name']
    FINAL['addr'] = addr
    FINAL['city'] = city
    FINAL['state'] = state
    FINAL['zipcode'] = zipcode
    FINAL['hours'] = []
    FINAL['open_today'] = False
    FINAL['open_saturday'] = False
    if 'current_opening_hours' in q:
        if q['current_opening_hours']['open_now']:
            FINAL['open_today'] = True
        else: 
            FINAL['open_today'] = False
        if 'periods' in q['current_opening_hours']:
            DH = {}
            for g in q['current_opening_hours']['periods']:
                # print("g=%s" % g)
                if 'close' in g:
                    day = DAY_MAPPING[g['close']['day']]
                    end = g['close']['time']
                if 'open' in g:
                    day = DAY_MAPPING[g['open']['day']]
                    start = g['open']['time']
                if day not in DH:
                    FINAL['hours'].append({'day':day,'open':start, 'close': end})
                DH[day] = 1
                if day == 'Sat':
                    FINAL['open_saturday'] = True
    FINAL['hours'] = json.dumps(FINAL['hours'])
    # print("FINAL_HOURS=%s" % FINAL['hours'])
    ph = q['formatted_phone_number']
    ph = ph.replace(" ",'').replace("-",'').replace(")","").replace("(",'')
    up = None
    if 'website' not in q:
        q['website'] = ''
    else:
        up = urlparse(q['website'])

    FINAL['name'] = q['name'] 
    FINAL['rating'] = 0
    if 'rating' in q:
        FINAL['rating'] = q['rating'] 
    FINAL['url'] = q['url'] 
    HOST = encryption.getSHA256()
    if up is not None:
        HOST = up.hostname
    # print("ph=%s" % ph)
    # print("HOST=%s" % HOST)
    hh = db.query("""
        select id as id,office_id,'oa' as k from office_addresses where phone=%s
        UNION ALL
        select office_id as id, office_id,'pq' as k from provider_queue
            where locate(%s,website) > 0
        UNION ALL
        select id as id,office_id,'op' as k from office_phones where phone=%s
        """,(ph,
            HOST,
            ph
        )
    )
    # print("hh=%s" % hh)
    if len(hh) > 0:
        score = 1
        FINAL['office_id'] = hh[0]['office_id']
        score = 1
    if score > .8:
        FINAL['have'] = True
        # print("Score = %s" % score)
        # print(json.dumps(q,indent=4))
        # print(FINAL)
        if 'website' not in q:
            q['website'] = ''
        if 'rating' not in q:
            q['rating'] = 0
        if 'office_id' in FINAL:
            db.update("""
                update office set 
                    name = %s,
                    office_hours = %s,
                    open_saturday = %s,
                    google_url = %s,
                    places_id = %s
                    where id = %s
                """,(
                    FINAL['name'],json.dumps(FINAL['hours']),FINAL['open_saturday'], q['url'],
                    FINAL['places_id'],FINAL['office_id']
                )
            )
            db.update("""
                insert into ratings (office_id,rating) values
                    (%s,%s)
                """,(FINAL['office_id'],FINAL['rating'])
            )
            db.update("""
                insert into office_potential_places (
                    office_id,name,
                    places_id,addr1,city,state,zipcode,
                    score,lat,lon,website,google_url,rating
                    ) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,(
                    FINAL['office_id'],q['name'],
                    q['place_id'],addr,city,state,zipcode,score,
                    q['geometry']['location']['lat'],
                    q['geometry']['location']['lng'],
                    q['website'],q['url'],q['rating']
                    )
            )
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,1,'Updated address with a score > .8'
                )
            """,(FINAL['office_id'],)
            )
    else:
        FINAL['have'] = False
        if 'website' not in q:
            q['website'] = ''
        if 'rating' not in q:
            q['rating'] = 0
        # print("myq=")
        # print(json.dumps(q,indent=4))
        em = encryption.getSHA256()
        db.update("""
            insert into users (
                email,first_name,last_name,phone,active 
            ) values (%s,'','',%s,0) 
            """,('%s@poundpain.com' % em[:10],q['formatted_phone_number'])
        )
        user_id = db.query("select LAST_INSERT_ID()");
        user_id = user_id[0]['LAST_INSERT_ID()']
        db.update("""
            insert into office (
                name, places_id, active, office_type_id, 
                google_url,
                open_saturday, office_hours
            ) values (%s,%s,0,%s,%s,%s,%s) 
            """,(
                q['name'],q['place_id'],OT['Chiropractor'],
                q['url'], FINAL['open_saturday'],FINAL['hours']
            )
        )
        off_id = db.query("select LAST_INSERT_ID()");
        off_id = off_id[0]['LAST_INSERT_ID()']
        FINAL['office_id'] = off_id
        FINAL['office_added'] = True
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,1,'Imported from google places'
            )
        """,(off_id,))
        db.update("""
            insert into office_user (office_id,user_id) values (%s,%s)
            """,(off_id,user_id)
        )
        db.update("""
            insert into office_addresses (
                office_id,lat,phone,lon,addr1,city,state,zipcode,places_id,
                name
            ) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,(
                off_id, q['geometry']['location']['lat'],ph,
                q['geometry']['location']['lng'],
                addr,city,state,zipcode,q['place_id'],q['name']
                ) 
        )
        oa_id = db.query("select LAST_INSERT_ID()");
        oa_id = oa_id[0]['LAST_INSERT_ID()']
        db.update("""insert into ratings (office_id,rating) 
            values (%s,%s)
            """,(off_id,q['rating'])
        )
        db.update("""
            insert into provider_queue (office_id,website,places_id,
                provider_queue_lead_strength_id
                )
                values (%s,%s,%s,%s)
            """,(
                off_id, q['website'],q['place_id'],
                STR['Potential Provider']
                )
        )
        pq_id = db.query("select LAST_INSERT_ID()");
        pq_id = pq_id[0]['LAST_INSERT_ID()']
        db.update("""
            insert into office_history(office_id,user_id,text) values (
                %s,1,'Imported from google places'
            )
        """,(off_id,))
        db.update("""
            insert into office_potential_places (
                office_id,office_addresses_id,name,
                places_id,addr1,city,state,zipcode,
                score,lat,lon,website,google_url,rating
                ) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,(
                off_id,oa_id,q['name'],
                q['place_id'],addr,city,state,zipcode,score,
                q['geometry']['location']['lat'],
                q['geometry']['location']['lng'],
                q['website'],q['url'],q['rating']
                )
        )
    db.update("""
        update office set google_check = 1 where id=%s
        """,(FINAL['office_id'],)
    )
    # print("FINAL=%s" % FINAL)
    if not args.dryrun:
        db.commit()
    return FINAL
        

if args.zipcode is not None:
    o = db.query("""
        select lat,lon from position_zip where zipcode=%s
        """,(args.zipcode,)
    )
    qr = []
    places = []
    if not os.path.exists("%s.json" % args.zipcode):
        token = None
        qr = gp.nearby_search(
            lat_lng={ 'lat':o[0]['lat'], 'lng':o[0]['lon'] },
            radius=50000,
            keyword='Chiropractor'
        )
        token = qr.next_page_token 
        for place in qr.places:
            place.get_details()
            q = json.loads(json.dumps(place.details,use_decimal=True))
            places.append(q)
        PLACE_CACHE = {}
        while token is not None:
            qr = gp.nearby_search(
                lat_lng={ 'lat':o[0]['lat'], 'lng':o[0]['lon'] },
                radius=50000,
                keyword='Chiropractor',
                pagetoken=token)
            # print("token=%s" % qr.next_page_token)
            # print("len=%s" % len(qr.places))
            if isinstance(qr.next_page_token,list):
                break
            token = qr.next_page_token
            if len(qr.places) < 1:
                break
            for place in qr.places:
                place.get_details()
                q = json.loads(json.dumps(place.details,use_decimal=True))
                pid = q['place_id']
                # print("pid=%s" % pid)
                if pid in PLACE_CACHE:
                    continue
                PLACE_CACHE[pid] = 1
                places.append(q)
            # print(len(places))

        H=open("%s.json" % args.zipcode,"w")
        H.write(json.dumps(places,indent=4))
        H.close()
    else:
        print("loading cached file %s.json" % args.zipcode)
        H=open("%s.json" % args.zipcode,"r")
        places = json.loads(H.read())
        H.close()
    data = []
    for x in places:
        j = processLocation(x)
        # print("ret=%s" % j)
        if j is not None:
            data.append(j)
    H = open("output-%s.json" % args.zipcode,"w")
    H.write(json.dumps(data))
    H.close()
    df = pd.DataFrame(data)
    df.to_csv("output-%s.csv" % args.zipcode)
    sys.exit(0)

