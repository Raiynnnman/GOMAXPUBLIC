# coding=utf-8

import sys
import os
import json
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))

from util import encryption,calcdate
from processing.UserLogin import ResetPasswordGetToken
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
import requests
from processing import UserLogin
from util import Performance
from util.Mail import Mail

log = Logging()
config = settings.config()
config.read("settings.cfg")

class SearchBase(SubmitDataRequest):

    def __init__(self):
        super().__init__()

class SearchConfig(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getZipFromLat(self,lat,lon):
        ret = ""
        db = Query()
        o = db.query("""
            select zipcode,
                st_distance_sphere(point(%s,%s),point(lon,lat))*.000621371192 as miles
            from position_zip 
            where 
                st_distance_sphere(point(%s,%s),point(lon,lat))*.000621371192 < 5
            order by 
                miles 
            limit 1
            """,(lon,lat,lon,lat)
        )
        if len(o) > 0:
            ret = o[0]["zipcode"]
        return ret

    def execute(self, *args, **kwargs):
        ret = {}
        lat = 0
        lon = 0
        # TODO: Put a guard on this for location blockage
        if len(args) > 1:
            a = args[1][0]
            if 'location' in a:
                lat = a['location']['lat']
                lon = a['location']['lon']
        db = Query()
        l = db.query("""
            select ot.id,otd.name,otd.description 
            from 
                office_type ot, office_type_descriptions otd
            where 
                ot.name <> 'Patient' and
                otd.office_type_id = ot.id
            """)
        ret['types'] = l
        return ret

class SearchGet(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def findLonLatFromZip(self,zipcode):
        db = Query()
        p = Performance.performance()
        p.start("")
        o = db.query("""
            select lon,lat
            from position_zip 
            where 
                zipcode = %s
            limit 1
            """,(zipcode,)
        )
        lon = 0
        lat = 0
        if len(o) > 0:
            lon = o[0]['lon']
            lat = o[0]['lat']
        return lon,lat

    def execute(self, *args, **kwargs):
        ret = []
        params = args[1][0]
        if 'type' not in params:
            return { 'providers':ret }
        provtype = params['type']
        zipcode = 0
        lat = 0
        lon = 0
        if 'location' in params and params['location'] is not None:
            lat = params['location']['lat']
            lon = params['location']['lon']
        if 'zipcode' in params: 
            (lon,lat) = self.findLonLatFromZip(params['zipcode'])
        db = Query()
        # Save for debugging
        #o = db.query("""
        #    select 
        #        office_id,st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192 as dist
        #    from 
        #        office_addresses oa
        #    where
        #        st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192 < 50 
        #    """,(lon,lat,lon,lat))
        #log.debug("dist=%s" % o)
        IDS = []
        limit = 10
        if 'all' in params and params['all']:
            limit = 10000
        o = db.query("""
            select
                oa.id,o.id as office_id,
                o.name as office_name,
                JSON_OBJECT(
                    'id',oa.id,'addr1',concat(oa.addr1,' ',ifnull(oa.addr2,'')),'phone',oa.phone,
                    'lat',oa.lat,'lon',oa.lon, 'city',oa.city,'state',
                    oa.state,'zipcode',oa.zipcode
                ) as addr,
                round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) as miles
            from
                office_addresses oa,
                office o,
                provider_queue pq
            where
                st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192 < 10 and
                pq.office_id = o.id and
                oa.office_id = o.id and
                o.active = 1 and
                oa.lat <> 0 and
                o.office_type_id = %s
            order by
                pq.provider_queue_status_id, 
                round(st_distance_sphere(point(%s,%s),point(oa.lon,oa.lat))*.000621371192,2) 
            limit %s
            """,(lon,lat,lon,lat,provtype,lon,lat,limit)
        )
        for x in o:
            x['addr'] = json.loads(x['addr'])
            IDS.append(x['id'])
            x['profile'] = db.query("""
            select
                o.id as office_id,o.name,oa.phone,
                u.first_name,u.last_name,u.title,
                pm.headshot,pm.video,u.id as phy_id
            from
                users u
                left join office_user ou on ou.user_id = u.id
                left join office o on o.id = ou.office_id
                left join office_addresses oa on oa.office_id=o.id
                left join provider_queue pq on o.id = pq.office_id 
                left outer join office_provider_media pm on pm.user_id = u.id
            where
                o.id = %s
            """,(x['office_id'],)
            )
            x['rating'] = db.query(
                "select ifnull(round(avg(rating),2),0) as avg from ratings where office_id=%s",(x['office_id'],)
            )
            x['about'] = ''
            if len(x['profile']) > 0:
                x['profile'] = x['profile'][0]
            else:
                x['profile'] = {}
            if len(x['rating']) > 0:
                x['rating'] = x['rating'][0]['avg']
            else:
                x['rating'] = 0
            ret.append(x)
        vid = 0
        sha = encryption.getSHA256("%s,%s" %(lat,lon))
        db.update("""
            insert into search_no_results(sha,lat,lon,ret_size,office_ids) values (%s,%s,%s,%s,%s)
            """,(sha,lat,lon,len(ret),json.dumps(IDS))
        )
        if 'novisit' not in params:
            db.update("insert into visits (office_type_id) values (%s)",(provtype,))
            vid = db.query("select LAST_INSERT_ID()");
            vid = vid[0]['LAST_INSERT_ID()']
        db.commit()
        myret = {
            'providers':ret,
            'visit_id': vid
        } 
        return myret

class SearchReservation(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        params = args[1][0]
        procedure_id = params['procedure']
        APPT_STATUS=self.getAppointStatus()
        o = db.query("""
            select id from physician_schedule_scheduled where physician_schedule_id=%s
        """,(params['id'],)
        )
        off = db.query("""
            select 
                ou.office_id,office.email as office_email 
            from 
                physician_schedule ps 
                left join office_user ou on ou.user_id = ps.user_id 
                left join office on office.id = ou.office_id
            where 
                ps.id = %s
        """, (params['id'],)
        )
        if len(o) > 0:
            ret = { 
                "success":False,
                "reason": "ALREADY_RESERVED"
            }
            return ret
        db.update("""
            insert into physician_schedule_scheduled 
                (physician_schedule_id,appt_status_id,subprocedures_id) values (%s,%s,%s)
            """,(params['id'],APPT_STATUS['RESERVED'],procedure_id)
        )
        db.commit()
        off_mail = OfficeAppointmentEmail()
        off_mail.execute(off)
        pss_id = db.query("select LAST_INSERT_ID()");
        pss_id = pss_id[0]['LAST_INSERT_ID()']
        if 'leads_id' in params:
            o = db.query(""" 
                select first_name,last_name,email,phone,zipcode
                from leads where id=%s""",(params['leads_id'],)
            )
            if len(o) < 1:
                ret = { 
                    "success":False,
                    "reason": "LEAD_NOT_FOUND"
                }
                return ret
            s = SearchRegister()
            h,user_id = s.createUser(
                db,o[0]['email'].lower(),o[0]['first_name'],
                o[0]['last_name'],o[0]['phone'],o[0]['zipcode']
            )
            db.update("""
                update physician_schedule_scheduled set updated=now(),leads_id=%s,user_id=%s where id=%s
                """,(params['leads_id'],user_id,pss_id)
            )
            db.commit()
            custom_appt = WelcomeEmail()
            custom_appt.execute(o, o)
        ret = { 
            "success":True
        }
        return ret

class WelcomeEmailReset(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = []
        params = args[1][0]
        if 'email' not in params:
            raise Exception('EMAIL_REQUIRED')
        email = params['email'].lower()
        db = Query()
        o = db.query("""
            select id from users where email=%s
        """,(email.lower(),)
        )
        if len(o) < 1:
            ret = { 
                "success":False,
                "message": "USER_DOESNT_EXIST"
            }
            return ret
        user_id = o[0]['id']
        url = config.getKey("host_url")
        ul = UserLogin.ResetPasswordGetToken()
        val = ul.genToken(user_id,email.lower())
        data = { 
            '__LINK__':"%s/#/reset/%s" % (url,val.decode('utf-8')),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/reset/%s" % (url,val.decode('utf-8'))
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        m = Mail()
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Provider Contacted with POUNDPAIN TECH","templates/mail/welcome-reset.html",data)
        else:
            m.defer(email,"Provider Contacted with POUNDPAIN TECH","templates/mail/welcome-reset.html",data)
        return ret

class WelcomeEmail(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = []
        params = args[1][0]
        if 'email' not in params:
            raise Exception('EMAIL_REQUIRED')
        email = params['email']
        db = Query()
        o = db.query("""
            select id from users where email=%s
        """,(params['email'].lower(),)
        )
        if len(o) < 1:
            ret = { 
                "success":False,
                "message": "USER_DOESNT_EXIST"
            }
            return ret
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/login" % (url,),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % (url,)
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        m = Mail()
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Provider Contacted with POUNDPAIN TECH","templates/mail/appointment.html",data)
        else:
            m.defer(email,"Provider Contacted with POUNDPAIN TECH","templates/mail/appointment.html",data)
        return ret

class OfficeAppointmentEmail(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, off):
        ret = []
        params = off[0]
        if 'office_email' not in params or params['office_email'] is None:
            return
        email = params['office_email']
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/login" % (url,),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % (url,)
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        m = Mail()
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Client Acquired with POUNDPAIN TECH","templates/mail/office-appointment.html",data)
        else:
            m.defer(email,"Client Acquired with POUNDPAIN TECH","templates/mail/office-appointment.html",data)
        return ret

class ConsultantAppointmentEmail(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, consultant):
        ret = []
        params = consultant[0]
        if 'email' not in params or params['email'] is None:
            return
        email = params['email']
        url = config.getKey("host_url")
        data = { 
            '__LINK__':"%s/#/login" % (url,),
            '__BASE__':url
        } 
        if self.isUIV2(): 
            data['__LINK__']:"%s/login" % url
        if config.getKey("appt_email_override") is not None:
            email = config.getKey("appt_email_override")
        m = Mail()
        if config.getKey("use_defer") is not None:
            m.sendEmailQueued(email,"Provider Contacted with POUNDPAIN TECH","templates/mail/consultant-appointment.html",data)
        else:
            m.defer(email,"Provider Contacted with POUNDPAIN TECH","templates/mail/consultant-appointment.html",data)
        return ret

class SearchRegister(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def createUser(self, db, email, first_name, last_name, phone, zipcode):
        haveUser = False
        o = db.query("""
            select id from users where email=%s
        """,(email.lower(),)
        )
        user_id = 0
        if len(o) < 1:
            haveUser = False
            db.update("""
                insert into users (email,first_name,last_name,phone) values (
                    %s,%s,%s,%s
                )
                """,(email.lower(),first_name,last_name,phone)
            )
            user_id = db.query("select LAST_INSERT_ID()");
            user_id = user_id[0]['LAST_INSERT_ID()']
            PERM = self.getPermissionIDs()
            ENT = self.getEntitlementIDs()
            if zipcode is not None:
                db.update("""
                    insert into user_addresses (user_id,zipcode) values (%s,%s)
                    """,(user_id,zipcode)
                )
            db.update("""
                insert into user_entitlements (user_id,entitlements_id) values (%s,%s)
                """,(user_id,ENT['Customer'])
            )
            db.update("""
                insert into user_permissions (user_id,permissions_id) values (%s,%s)
                """,(user_id,PERM['Write'])
            )
            db.commit()
        else:
            haveUser = True
            user_id = o[0]['id']
        return haveUser,user_id

    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        params = args[1][0]
        user_id = 0
        haveUser = False
        REF = self.getReferrerUserStatus()
        APPT_STATUS=self.getAppointStatus()
        if 'zipcode' not in params:
            params['zipcode'] = ''
        if 'phone' not in params:
            params['phone'] = ''
        if 'user_id' in params:
            haveUser = True
            user_id = params['user_id']
            g = db.query("""
                select email,first_name,last_name,phone
                from users where id = %s
                """,(user_id,)
            )
            params.update(g[0])
        else:
            haveUser,user_id = self.createUser(db,
                params['email'].lower(),params['first_name'],
                params['last_name'],params['phone'], params['zipcode'])
        db.update("""
            insert into client_intake (user_id) values (%s)
            """,(user_id,)
        )
        ci_id = db.query("select LAST_INSERT_ID()");
        ci_id = ci_id[0]['LAST_INSERT_ID()']
        db.update("""
           insert into client_intake_offices 
                (client_intake_id,office_id,client_intake_status_id,office_addresses_id) 
                    values(%s,%s,%s,%s)
           """,(ci_id,params['office_id'],1,params['office_addresses_id'])
            )
        db.update("""
            insert into referrer_users(
                referrer_users_status_id,email,name,phone,
                office_id,client_intake_id,row_meta,user_id,
                office_addresses_id
            ) values (
                %s,%s,%s,%s,%s,%s,%s,%s,%s
            )
        """,(
            REF['QUEUED'],params['email'],
            "%s %s" % (params['first_name'],params['last_name']),
            params['phone'],params['office_id'],ci_id,json.dumps(params),
            user_id,params['office_addresses_id']
        ))
                
        ret = { 
            "success":True
        }
        if config.getKey("appt_email_override") is not None:
            params['email'] = config.getKey("appt_email_override")
        if haveUser:
            r = WelcomeEmail()
            r.execute(*args,**kwargs)
        else:
            r = WelcomeEmailReset()
            r.execute(*args,**kwargs)
        if False: # Turn this off for a moment, should go to accept/reject queue
            off = db.query("""
                select
                    o.id,
                    o.email as office_email
                from
                    office o
                where
                    o.id = %s
                """,(params['office_id'],)
            )
            if config.getKey("appt_email_override") is not None:
                off[0]['office_email'] = config.getKey("appt_email_override")
            oMail = OfficeAppointmentEmail()
            oMail.execute(off)
        db.commit()
        return ret

class SearchSchedule(SearchBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        lat = 0
        lon = 0
        db = Query()
        params = {}
        if len(args) > 1:
            params = args[1][0]
        o = db.query("""
                select ps.id,ps.day,time_format(ps.time,'%h:%i%p') as time
                from 
                    physician_schedule ps
                    left outer join physician_schedule_scheduled pss on pss.physician_schedule_id = ps.id
                where 
                    active = 1 and
                    tstamp > now() and
                    pss.id is null and
                    day = %s and
                    ps.user_id=%s 
                order by 
                    tstamp
            """,(params['date'],params['id'],)
        )
        ret['schedule'] = o
        return ret
