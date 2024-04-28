#!/usr/bin/python

import os
import random
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

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--office', dest="office", action="store")
parser.add_argument('--zipcode', dest="zipcode", action="store")
args = parser.parse_args()

gp = GooglePlaces(config.getKey("google_api_key"))

db = Query()

q = """
        select 
            office_id,
            o.name,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id',oa.id,'name',oa.name,'addr1',oa.addr1,'addr2',
                    oa.addr2,'phone',ifnull(oa.phone,''),'office_id',oa.office_id,
                    'city',oa.city,'state',oa.state,'zipcode',oa.zipcode)
            ) as addr
        from
            office o,
            office_addresses oa
        where
            o.id = oa.office_id and 
            o.google_check = 0
    """

if args.office is not None:
    q += " and o.id = %s " % args.office
    
q+=" group by o.id "
q+=" limit 25 "
o = db.query(q)

random.shuffle(o)

STR = getIDs.getLeadStrength()
OT = getIDs.getOfficeTypes()
PLACES = {}

def processLocation(row,q,dedup=False):
    global db
    global PLACES
    FINAL = {}
    if 'health' not in q['types']:
        print("not health")
        return None
    if q['business_status'] != "OPERATIONAL":
        print("not operational")
        return None
    pid = q['place_id']
    has = db.query("""
        select id from office_potential_places where places_id=%s
        UNION ALL
        select id from provider_queue where places_id=%s
        UNION ALL
        select id from office where places_id=%s
    """,(pid,pid,pid))
    if len(has) > 0:
        print("places found")
        return None
    if pid in PLACES:
        print("Already have %s" % pid)
        return None
    PLACES[pid] = 1
    arr = ['addr1','city','state']
    rtok = []
    if 'addr1' in row:
        rtok = row['addr1'].split(' ')
    gtok = q['formatted_address'].split(' ')
    score = 0
    t = min(len(gtok),len(rtok))
    # print("min = %s" % t)
    for v in range(t):
        if rtok[v].lower() == gtok[v].lower():
            score += .2
    # print("q=%s" % json.dumps(q,indent=4))
    if 'formatted_phone_number' not in q:
        print("business has no phone")
        return None
    gphone = q['formatted_phone_number']
    gphone = gphone.replace(" ",'').replace("-",'').replace(")","").replace("(",'')
    ophone = ''
    if 'phone' in row:
        ophone = row['phone'].replace(" ",'').replace("-",'').replace(")","").replace("(",'')
    FINAL['phone'] = gphone
    if 'website' in q:
        gweb = q['website']
        FINAL['website'] = gweb
    if gphone == ophone:
        score += 1
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
    if 'current_opening_hours' in q:
        if q['current_opening_hours']['open_now']:
            FINAL['open_today'] = True
        else: 
            FINAL['open_today'] = False
        FINAL['hours'] = q['current_opening_hours']
    ph = q['formatted_phone_number']
    ph = ph.replace(" ",'').replace("-",'').replace(")","").replace("(",'')
    hh = db.query("""
        select id,office_id from office_addresses where phone=%s
        """,(ph,)
    )
    FINAL['name'] = q['name'] 
    FINAL['rating'] = 0
    if 'rating' in q:
        FINAL['rating'] = q['rating'] 
    FINAL['url'] = q['url'] 
    if len(hh) > 0:
        score = 1
        row['office_id'] = hh[0]['office_id']
        row['id'] = hh[0]['id']
        FINAL['office_id'] = hh[0]['office_id']
    if score > .8:
        FINAL['have'] = True
        print("Score = %s" % score)
        print(json.dumps(q,indent=4))
        print(row)
        if 'website' not in q:
            q['website'] = ''
        if 'rating' not in q:
            q['rating'] = 0
        if 'office_id' in row:
            db.update("""
                insert into office_potential_places (
                    office_id,office_addresses_id,name,
                    places_id,addr1,city,state,zipcode,
                    score,lat,lon,website,google_url,rating
                    ) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,(
                    row['office_id'],row['id'],q['name'],
                    q['place_id'],addr,city,state,zipcode,score,
                    q['geometry']['location']['lat'],
                    q['geometry']['location']['lng'],
                    q['website'],q['url'],q['rating']
                    )
            )
            db.update("""
                update office set updated=now() where id=%s
                """,(row['office_id'],)
            )
            db.update("""
                insert into office_history(office_id,user_id,text) values (
                    %s,1,'Updated address with a score > .8'
                )
            """,(row['office_id'],)
            )
    else:
        FINAL['have'] = False
        if 'website' not in q:
            q['website'] = ''
        if 'rating' not in q:
            q['rating'] = 0
        print("myq=")
        print(json.dumps(q,indent=4))
        hh = db.query("""
            select id from office_addresses where phone=%s
            """,(ph,)
        )
        if len(hh) > 0:
            print("I think I already have %s (%s)",(q['place_id'],ph))
            return None
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
                name, places_id, active, office_type_id
            ) values (%s,%s,0,%s) 
            """,(q['name'],q['place_id'],OT['Chiropractor'])
        )
        off_id = db.query("select LAST_INSERT_ID()");
        off_id = off_id[0]['LAST_INSERT_ID()']
        row['office_id'] = off_id
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
            insert into provider_queue_history(provider_queue_id,user_id,text) values (
                %s,1,'Imported from google places'
            )
        """,(pq_id,))
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
        """,(row['office_id'],)
    )
    db.commit()
    print("FINAL=%s" % FINAL)
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
            radius=16093,
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
                radius=16093,
                keyword='Chiropractor',
                pagetoken=token)
            print("token=%s" % qr.next_page_token)
            print("len=%s" % len(qr.places))
            if isinstance(qr.next_page_token,list):
                break
            token = qr.next_page_token
            if len(qr.places) < 1:
                break
            for place in qr.places:
                place.get_details()
                q = json.loads(json.dumps(place.details,use_decimal=True))
                pid = q['place_id']
                print("pid=%s" % pid)
                if pid in PLACE_CACHE:
                    continue
                PLACE_CACHE[pid] = 1
                places.append(q)
            print(len(places))

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
        j = processLocation({},x)
        print("ret=%s" % j)
        if j is not None:
            data.append(j)
    H = open("output-%s.json" % args.zipcode,"w")
    H.write(json.dumps(data))
    H.close()
    df = pd.DataFrame(data)
    df.to_csv("output-%s.csv" % args.zipcode)
    sys.exit(0)

for x in o:
    x['addr'] = json.loads(x['addr'])
    print(x)
    DONE = False
    r = []
    for g in x['addr']:
        if g['id'] is None:
            continue
        qr = None
        qr = gp.nearby_search(
            location='%s %s, %s' % (g['addr1'],g['city'],g['state']),
            keyword='Chiropractor',
            radius=1000
        )
        #qr = gp.nearby_search(
        #    location="11623 Sagecanyon Dr, Houston, TX",
        #    keyword='Chiropractor',
        #    radius=1000
        #)
        for place in qr.places:
            place.get_details()
            q = json.loads(json.dumps(place.details,use_decimal=True))
            r.append(q)
        print(r)
        processLocation(g,r)
    break
