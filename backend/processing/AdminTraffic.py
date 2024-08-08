# coding=utf-8

import sys
import os
import pyap
import json
import unittest
import traceback
import base64
import jwt
import pandas as pd
from io import StringIO
from nameparser import HumanName
import googlemaps

sys.path.append(os.path.realpath(os.curdir))

from util import relativeTime
from util import tzInfo
from util import encryption
from util import calcdate
from util import S3Processing
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Admin import AdminBase
from processing.Audit import Audit
from processing import Search,Office
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin,check_bdr
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class TrafficGet(AdminBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getTrafficData(self,*args,**kwargs):
        ret = {}
        params = args[0]
        limit = 10000
        offset = 0
        lat = lng = None
        if 'limit' in params:
            limit = params['limit']
        if 'offset' in params:
            offset = params['offset']
        if 'location' in params:
            lat = params['lat']
            lng = parans['lng']
        print("TG: params=%s" % params)
        STR = self.getLeadStrength()
        TZ = tzInfo.getTZ()
        OT = self.getOfficeTypes()
        db = Query()
        BLUR = False
        if 'blur' in params:
            BLUR = True
        ret['config'] = {}
        ret['data'] = []
        ret['config']['avail'] = []
        tz_off = 0
        if 'timezone' in params and params['timezone'] in TZ:
             tz_off = TZ[params['timezone']]
        if False: # Take this out for now
            l = db.query("""
                select count(id) as cnt,date(ti.created) as day 
                    from traffic_incidents ti group by date(created) order by date(created) desc
                """)
            ret['config']['avail'] = l
        ret['config']['office_types'] = db.query("""
            select id,name from office_type where id <> %s
            """,(OT['Referrer'],)
        )
        ret['config']['avail'].insert(0,{'id':0,'day':'All'})
        if False: # Take this out for now
            l = db.query("""
                select count(id) as cnt,zipcode as zipcode 
                from traffic_incidents 
                group by zipcode order by zipcode desc
                """)
            ret['config']['locations'] = l
            ret['config']['locations'].insert(0,{'id':0,'zipcode':'All'})
        # Temporary - Just get accidents
        l = db.query("""
            select id,name from traffic_categories where category_id = 1
            UNION ALL
            select 99,'Preferred Providers'
            UNION ALL
            select 101,'Potential Providers'
            UNION ALL
            select 102,'Customers'
            UNION ALL
            select 103,'No Results'
            UNION ALL
            select 104,'Pending Provider'
            """)
        ret['config']['categories'] = l
        ret['config']['timezones_offset'] = db.query("""
            select tz_name,tz_hours
                from position_zip group by tz_name;
            """
        )
        if 'categories' not in params or len(params['categories']) == 0:
            return ret
        #Incase we need to do time offsets
        #l = db.query("""
        #    select code1 from position_zip where zipcode = %s
        #    """,(params['zipcode'],)
        #)
        #state = l[0]['code1']
        #l = db.query("""
        #    select offset from traffic_cities tc, timezones t 
        #    where 
        #        tc.state = %s and
        #        t.id = tc.tz
        #    """,(state,)
        #)
        #offset = l[0]['offset']
        sqlp = []
        q = """
            select
                ti.lat as lat ,ti.lon as lng
            from
                traffic_incidents ti,
                traffic_coordinates tc
            where
                1 = 1 and
                tc.traffic_incidents_id = ti.id and 
        """
        if 'date' in params:
            q += " date(ti.created) = %s and "
            sqlp.append(params['date'])
        q += """
                1 = 1
            limit 1
        """
        l = db.query(q,sqlp)
        if len(l) > 0:
            if 'zipcode' in params:
                o = db.query("""
                    select lat,lon as lng from 
                    position_zip where zipcode=%s
                    """,(params['zipcode'],)
                )
                if len(o) > 0:
                    ret['center'] = {'lat':o[0]['lat'],'lng':o[0]['lng']}
                else:
                    w = int(len(l)/2)
                    ret['center'] = {'lat':l[w]['lat'],'lng':l[w]['lng']}
            else:
                w = int(len(l)/2)
                ret['center'] = {'lat':l[w]['lat'],'lng':l[w]['lng']}
        else:
            ret['center'] = {'lat':0,'lng':0}
        if 2 in params['categories']: # Accidents
            sqlp = []
            q = """
                select
                    ti.uuid,ti.traffic_categories_id as category_id,
                    tcat.name as category,ti.zipcode,ti.city,ti.traf_start_time,
                    ti.traf_end_time,ti.traf_num_reports,ti.lat,ti.lon as lng,
                    ti.traf_magnitude,ti.traf_delay,ti.state,ti.created,
                    ti.traffic_incidents_contact_id,ti.traf_from,
                    date_add(traf_start_time,INTERVAL %s hour) as traf_start_time_offset,
                    ifnull(pz.tz_name,'UTC') as tz_name,
                    ifnull(pz.tz_hours,0) as tz_hours,
                    ifnull(pz.tz_short,'UTC') as tz_short,
                    json_arrayagg(
                        json_object(
                            'lat',tc.lat,
                            'lng',tc.lon,
                            'ord',tc.ord
                        )
                    ) as coords
                from
                    traffic_incidents ti
                    left join traffic_categories tcat on ti.traffic_categories_id = tcat.id
                    left join traffic_coordinates tc on tc.traffic_incidents_id = ti.id
                    left join traffic_incidents_contact tic on tic.id = traffic_incidents_contact_id
                    left outer join position_zip pz on ti.zipcode = pz.zipcode
                where
                    1 = 1 
            """
            sqlp.append(-tz_off) # Make it negative because that dict has it set to positive
            if 'nationwide' not in params:
                q += """ 
                    and round(st_distance_sphere(point(%s,%s),point(ti.lon,ti.lat))*.000621371192,2) < 50
                    """
                sqlp.append(ret['center']['lng'])
                sqlp.append(ret['center']['lat'])
            if 'date' in params:
                q += " and date(ti.created) = %s "
                sqlp.append(params['date'])
            #if 'zipcode' in params:
            #    q += " ti.zipcode = %s and "
            #    sqlp.append(params['zipcode'])
            if 'categories' in params:
                q += " and ("
                A = []
                for g in params['categories']:
                    A.append(" ti.traffic_categories_id = %s ")
                    sqlp.append(g)
                q += " OR ".join(A)
                q += " ) "
            q += """
                group by
                    ti.id
                order by
                    ti.created desc
                limit %s offset %s
            """
            sqlp.append(limit)
            sqlp.append(offset*limit)
            print(q,sqlp)
            l = db.query(q,sqlp)
            ret['total'] = limit
            for x in l:
                x['coords'] = json.loads(x['coords'])
                x['contact'] = []
                if x['traffic_incidents_contact_id'] is not None:
                    x['contact'] = db.query("""
                        select 
                            tic.id,tic.first_name,tic.last_name,tic.dob,tic.twitter,
                            facebook,instagram,email,phone,contacted,cis.name as status,cis.id,
                            car_make,car_model,car_year,car_color,
                            timestampdiff(MINUTE,created,contacted) as contacted_timer
                        from 
                            traffic_incidents_contact tic
                            left outer join client_intake_status cis on cis.id = tic.client_intake_status_id
                        where
                            tic.id = %s
                        """,(x['traffic_incidents_contact_id'],)
                    )
                    x['contact'] = x['contact'][0]
                    if 'email' in x['contact'] and BLUR:
                        if x['contact']['email'] is not None:
                            g = x['contact']['email'].split('@')
                            l = len(g[1])
                            g[1] = ''
                            for v in range(l):
                                g[1] += "*" 
                            x['contact']['email'] = "@".join([g[0],g[1]])
                        if x['contact']['last_name'] is not None:
                            l = len(x['contact']['last_name'])
                            x['contact']['last_name'] = ''
                            for v in range(l):
                                x['contact']['last_name'] += "*" 
                        if x['contact']['twitter'] is not None:
                            g = x['contact']['twitter'][5:]
                            g = "****" + g
                            x['contact']['twitter'] = g
                        if x['contact']['instagram'] is not None:
                            g = x['contact']['instagram'][5:]
                            g = "****" + g
                            x['contact']['instagram'] = g
                        if x['contact']['facebook'] is not None:
                            g = x['contact']['facebook'][5:]
                            g = "****" + g
                            x['contact']['facebook'] = g
                        if x['contact']['phone'] is not None:
                            g = x['contact']['phone'][:6]
                            g += "****"
                            x['contact']['phone'] = g
                ret['data'].append(x)
        zipcoords = {}
        if 'zipcode' in params:
            ret['data'].append({
                'category_id':100,
                'coords':[ret['center']]
            })
            zipcoords = ret['center']
        if False and 102 in params['categories'] and 'zipcode' in params:
            o = db.query("""
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) as miles,
                    oa.city,oa.state,oa.zipcode,102 as category_id,pq.website,oa.phone,
                    'Potential Provider' as category, oa.lat, oa.lon as lng,
                    json_arrayagg(
                        json_object('lat',oa.lat,'lng',oa.lon)) as coords
                from 
                    office_addresses oa,
                    provider_queue_lead_strength pqls,
                    provider_queue pq
                where
                    lat <> 0 and
                    pq.provider_queue_lead_strength_id = %s and
                    round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) < 50 and
                    pq.provider_queue_lead_strength_id = pqls.id and
                    pq.office_id = oa.office_id
                group by 
                    oa.id
                """,(zipcoords['lng'],
                     zipcoords['lat'],
                     zipcoords['lng'],zipcoords['lat'])
            )
            for t in o:
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        if 104 in params['categories']:
            o = db.query("""
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    o.id as office_id,
                    oa.city,oa.state,oa.zipcode,104 as category_id,pq.website,
                    'Pending Provider' as category, oa.lat, oa.lon as lng,oa.phone,
                    pq.provider_queue_lead_strength_id as lead_strength,
                    o.office_type_id as office_type_id, ot.name as office_type,
                    0 as client_cound,
                    json_arrayagg(
                        json_object('lat',oa.lat,'lng',oa.lon)) as coords
                from 
                    office_addresses oa,office o,
                    provider_queue_lead_strength pqls,
                    office_type ot,
                    provider_queue pq
                where
                    lat <> 0 and
                    oa.office_id = o.id and
                    o.office_type_id = ot.id and
                    pq.provider_queue_lead_strength_id = %s and
                    pq.provider_queue_lead_strength_id = pqls.id and
                    pq.office_id = oa.office_id
                group by 
                    oa.id
                """,(STR['Pending Provider'],)
            )
            for t in o:
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        if 101 in params['categories']:
            if 'lng' not in zipcoords:
                zipcoords = ret['center']
            o = db.query("""
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) as miles,
                    oa.phone, oa.city,oa.state,oa.zipcode,101 as category_id,
                    'Potential Provider' as category, oa.lat, oa.lon as lng,oa.phone,
                    o.office_type_id as office_type_id, ot.name as office_type,
                    json_arrayagg(
                        json_object('lat',oa.lat,'lng',oa.lon)) as coords
                from 
                    office_addresses oa, 
                    office o,
                    provider_queue_lead_strength pqls,
                    office_type ot,
                    provider_queue pq
                where
                    lat <> 0 and
                    oa.office_id = o.id and
                    ot.id = o.office_type_id and 
                    pq.provider_queue_lead_strength_id = %s and
                    round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) < 50 and
                    pq.provider_queue_lead_strength_id = pqls.id and
                    pq.office_id = oa.office_id
                group by 
                    oa.id
                """,(zipcoords['lng'],
                     zipcoords['lat'],STR['Potential Provider'],
                     zipcoords['lng'],zipcoords['lat'])
            )
            for t in o:
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        if 103 in params['categories']:
            o = db.query("""
                select 103 as category_id,'No Result' as category,
                  count(sha) as count, sha as uuid,
                  lat as lat,lon as lng,
                  city, state,
                  json_array(json_object('lat',lat,'lng',lon)) as coords,0 as zipcode
                from 
                    search_no_results
                where 
                    lat <> 0 and 
                    created > date_add(created,INTERVAL -60 DAY) 
                group by sha
                """)
            for t in o:
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        ## -- HeatMap
        TC = self.getTrafficCategories()
        o = db.query("""
            select 104 as category_id,'HeatMap' as category,
                ti.zipcode,count(ti.zipcode) as weight,uuid() as uuid,
                pz.lat as lat,pz.lon as lng,
                json_object('lat',pz.lat,'lng',pz.lon) as coords 
            from 
                traffic_incidents ti,position_zip pz 
            where 
                pz.zipcode=ti.zipcode and 
                ti.traffic_categories_id=%s 
            group by zipcode
            """,(TC['Accident'],)
        )
        ret['heatmap'] = []
        for t in o:
            t['coords'] = json.loads(t['coords'])
            ret['heatmap'].append(t) 
        o = db.query("""
            select
                ti.city,ti.state,ti.zipcode,count(ti.id) as accidents,
                ifnull(net.cnt,0) as innetwork,ifnull(pot.cnt,0) as potential,
                pz.lat as lat,pz.lon as lng,
                count(ti.id)+ifnull(net.cnt,0)+ifnull(pot.cnt,0) as weight,
                json_object('lat',pz.lat,'lng',pz.lon) as coords 
            from
                traffic_incidents ti
                left join (
                    select 
                        count(pq.id) as cnt,oa.zipcode 
                    from 
                        provider_queue pq, office_addresses oa 
                    where 
                        oa.office_id=pq.office_id and pq.provider_queue_status_id = 50
                    group by zipcode
                ) net on net.zipcode = ti.zipcode
                left join (
                    select 
                        count(pq.id) as cnt,oa.zipcode 
                    from 
                        provider_queue pq, office_addresses oa 
                    where 
                        oa.office_id=pq.office_id and pq.provider_queue_status_id <> 50
                    group by zipcode
                ) pot on pot.zipcode = ti.zipcode
                left join (
                    select lat,lon,zipcode from position_zip
                ) pz on pz.zipcode = ti.zipcode
            where
                ti.traffic_categories_id = 2 
            group by
                ti.zipcode
            order by 
                count(ti.id)+ifnull(net.cnt,0)+ifnull(pot.cnt,0) desc
            """)
        ret['heatmap_potentials'] = []
        for t in o:
            t['coords'] = json.loads(t['coords'])
            ret['heatmap_potentials'].append(t) 
        if 99 in params['categories']:
            p = []
            p.append(STR['Potential Provider'])
            q = """
                select 
                    oa.id,oa.name,oa.addr1,'' as uuid,
                    oa.city,oa.state,oa.zipcode,99 as category_id,
                    oa.phone,oa.office_id,
                    ot.name as office_type,ot.id as office_type_id,
                    pq.provider_queue_lead_strength_id as lead_strength_id,
                    pqls.name as lead_strength,
                    'Preferred Provider' as category, oa.lat, oa.lon as lng,
                    json_arrayagg(
                        json_object('lat',oa.lat,'lng',oa.lon)) as coords
                from 
                    office_addresses oa,
                    office o,
                    office_type ot,
                    provider_queue_lead_strength pqls,
                    provider_queue pq
                where
                    lat <> 0 and
                    o.office_type_id=ot.id and
                    o.id = oa.office_id and
                    o.active = 1 and
                    pq.provider_queue_lead_strength_id <> %s and
                    pq.provider_queue_lead_strength_id = pqls.id and
                    pq.office_id = oa.office_id
                
            """
            if 'office_types' in params and len(params['office_types']) > 0:
                q += " and ("
                A = []
                for t in params['office_types']:
                    A.append(" o.office_type_id = %s ")
                    p.append(t)
                q += " OR ".join(A)
                q += ")"
            q += """
                group by 
                    oa.id
                """
            o = db.query(q,p)
            for t in o:
                t['providers'] = db.query("""
                    select u.id,u.first_name,u.last_name,u.email,u.phone 
                        from office_user ou,users u
                    where ou.user_id=u.id and ou.office_id=%s
                    """,(t['office_id'],)
                )
                t['rating'] = db.query("""
                    select avg(rating) as t from ratings where office_id=%s
                    """,(t['office_id'],)
                )
                t['rating'] = t['rating'][0]['t']
                t['users'] = db.query("""
                    select u.first_name,u.last_name,u.phone,u.email
                    from 
                        users u
                        left outer join office_user ou on ou.user_id = u.id
                    where
                        ou.office_id = %s
                    """,(t['office_id'],)
                )
                t['plan'] = db.query("""
                    select pd.description,pd.duration,op.start_date,timestampdiff(day,op.start_date,now()) as age
                    from 
                    office_plans op, pricing_data pd
                    where
                    pd.id = op.pricing_data_id
                    and office_id = %s
                    """,(t['office_id'],)
                )
                t['score'] = db.query("""
                    select
                        round(
                            timestampdiff(day,op.start_date,now()) -
                            count(cio.id)*5                        +
                            if(
                                st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192 > 5,
                                st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,
                                -st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192
                            )                                      +
                            count(i.cnt)*10                        +
                            (pd.duration*2) + (o.priority * 10)
                            ,2) as score
                    from
                        office o
                        left outer join client_intake_offices cio on cio.office_id = o.id
                        left outer join office_addresses oa on oa.office_id=o.id
                        left outer join office_plans op on op.office_id = o.id
                        left outer join pricing_data pd on op.pricing_data_id = pd.id
                        left outer join (select office_id,count(id) as cnt from 
                            invoices where office_id=%s and total > 0 and invoice_status_id=15) i on i.office_id=o.id
                    where
                        oa.id = %s
                    group by 
                        oa.id
                    """,(
                        ret['center']['lng'],ret['center']['lat'],
                        ret['center']['lng'],ret['center']['lat'],
                        ret['center']['lng'],ret['center']['lat'],
                        t['office_id'], t['id'],
                        )
                )
                t['score'] = t['score'][0]['score']
                db.update("""
                    update office set score = %s where id = %s
                    """,(t['score'],t['office_id'])
                )
                t['client_count'] = db.query("""
                    select count(id) as cnt from client_intake_offices where
                    office_addresses_id = %s
                    """,(t['id'],)
                )[0]['cnt']
                t['coords'] = json.loads(t['coords'])
                ret['data'].append(t) 
        db.commit() 
        return ret

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        today = calcdate.getYearToday()
        if 'date' in params:
            if params['date'] == 'All':
                del params['date']
        if 'zipcode' in params:
            if params['zipcode'] == 'All':
                del params['zipcode']
            if params['zipcode'] is None:
                del params['zipcode']
        return self.getTrafficData(params)
