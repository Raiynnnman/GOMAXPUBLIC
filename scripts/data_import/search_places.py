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

def processLocation(row,res):
    global db
    global PLACES
    print(len(res))
    for q in res:
        if 'health' not in q['types']:
            continue
        if q['business_status'] != "OPERATIONAL":
            continue
        pid = q['place_id']
        has = db.query("""
            select id from office_potential_places where places_id=%s
            UNION ALL
            select id from provider_queue where places_id=%s
            UNION ALL
            select id from office where places_id=%s
        """,(pid,pid,pid))
        if len(has) > 0:
            continue
        if pid in PLACES:
            print("Already have %s" % pid)
            continue
        PLACES[pid] = 1
        arr = ['addr1','city','state']
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
            print("business %s has no phone" % (q['places_id'],))
            continue
        gphone = q['formatted_phone_number']
        gphone = gphone.replace(" ",'').replace("-",'').replace(")","").replace("(",'')
        ophone = row['phone'].replace(" ",'').replace("-",'').replace(")","").replace("(",'')
        if 'website' in q:
            gweb = q['website']
            
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
        ph = q['formatted_phone_number']
        ph = ph.replace(" ",'').replace("-",'').replace(")","").replace("(",'')
        hh = db.query("""
            select id,office_id from office_addresses where phone=%s
            """,(ph,)
        )
        if len(hh) > 0:
            score = 1
            row['office_id'] = hh[0]['office_id']
            row['id'] = hh[0]['id']
        if score > .8:
            print("Score = %s" % score)
            print(json.dumps(q,indent=4))
            print(row)
            if 'website' not in q:
                q['website'] = ''
            if 'rating' not in q:
                q['rating'] = 0
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
                """,(x['office_id'],)
            )
        else:
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
                continue
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
            """,(x['office_id'],)
        )
        db.commit()
        

for x in o:
    x['addr'] = json.loads(x['addr'])
    print(x)
    DONE = False
    r = []
    for g in x['addr']:
        if g['id'] is None:
            continue
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
