# coding=utf-8

import sys
import os
import json
import unittest
import jwt
import base64

sys.path.append(os.path.realpath(os.curdir))

from util import encryption
from util.Logging import Logging
from util.Mail import Mail
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from processing.Profile import Profile
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_admin
from processing import Search

log = Logging()
config = settings.config()
config.read("settings.cfg")


class LeadsBase(SubmitDataRequest):

    def __init__(self):
        super().__init__()

class LeadsList(LeadsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def getPhysicians(self, rec):
        db = Query()
        o = db.query("select lon,lat from position_zip where zipcode=%s",(rec['zipcode'],))
        if len(o) <1:
            return []
        lon = o[0]['lon']
        lat = o[0]['lat']
        sg = Search.SearchGet()
        k = sg.execute(1,
            [{
                'location': { 'lon':lon,'lat': lat },
                'procedure':rec['subprocedures_id'],
                'novisit': True
            }]
            )
        return k

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        o = db.query("""
            select 
                u.id,u.first_name,u.last_name
            from
                leads_assignee la, users u
            where 
                la.user_id=u.id    
            """
        )
        s = db.query("select id,name from leads_status")
        p = db.query("select id,name from procedures")
        p.insert(0,{'id':0,'name':'Unknown'})
        s.insert(0,{'id':0,'name':'Unknown'})
        s1 = db.query("select id,procedures_id,name from subprocedures")
        s.insert(0,{'id':0,'name':'All'})
        ret['config'] = {
            'assignee':o,
            'status': s,
            'procedures': p,
            'subprocedures': s1
        }
        q = """
            select
                l.id as id,ls.name as leads_status,l.user_id as assignee_id,l.leads_status_id,
                l.first_name,l.last_name,l.phone,l.zipcode,l.email,addtime(l.created,%s) as created,
                addtime(l.updated,%s) as updated,l.zipcode,l.subprocedures_id,l.procedures_id,l.nhc_id,l.description,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',lc.id,'text',lc.text,'created',addtime(lc.created,%s),
                        'updated',addtime(lc.updated,%s),'user_id',lc.user_id,
                        'uuid',lc.uuid
                    )
                ) as comments,l.created as first_contact,ifnull(max(addtime(lc.updated,%s)),now()) as latest_comment
            from
                leads l
                left join leads_status ls on ls.id=l.leads_status_id
                left outer join leads_comments lc on lc.leads_id=l.id
            where 
                1 = 1
            """
        p=[user['timezone'],user['timezone'],user['timezone'],user['timezone'],user['timezone']]
        if 'status' in params:
            if params['status'] != 0:
                q += " and l.leads_status_id = %s"
                p.append(params['status'])
        if 'filter' in params:
            if params['filter'] == 1:
                q += " and l.user_id = %s"
                p.append(user['user_id'])
        q += " group by l.id order by l.created desc "
        o = db.query(q,p)
        ret['leads'] = []
        for x in o:
            if x['id'] is None:
                continue
            j = x
            j['pricing'] = {}
            det = db.query("""
                select id,age,height,weight,addr from leads_patient_details
                where leads_id = %s
                """,(x['id'],)
            )
            j['details'] = { 
                'addr': {}, 'age':'','height':'','weight':''
            }
            for oo in det:
                oo['addr'] = json.loads(oo['addr'])
                j['details'] = oo
            h = db.query("""
                select expensive,fair,great from leads_pricing
                    where procedures_id=%s
                """,(j['procedures_id'],)
            )
            if len(h) > 0:
                j['pricing'] = h[0]
            j['physicians'] = self.getPhysicians(j)
            h = []
            if isinstance(j['comments'],str):
                h = json.loads(j['comments'])
            else:
                h = j['comments']
            FIN = []
            for y in h:
                if y['id'] is None:
                    continue
                FIN.append(y)
            j['comments'] = FIN
            ret['leads'].append(j)
        return ret

class LeadsStatusUpdate(LeadsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        if 'assignee_id' in params:
            db.update("""update leads set updated=now(),user_id=%s where id=%s""",(params['assignee_id'],params['id']))
        if 'leads_status_id' in params:
            db.update("""update leads set updated=now(),leads_status_id=%s where id=%s""",(params['leads_status_id'],params['id']))
        db.commit()
        return {'success': True}

class LeadsUpdate(LeadsBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_admin
    def execute(self, *args, **kwargs):
        ret = {}
        db = Query()
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        insid = 0
        if 'id' in params:
            insid = params['id']
            db.update("""
                update leads 
                set updated=now(),
                    first_name=%s,last_name=%s,leads_status_id=%s,
                    phone=%s,zipcode=%s,email=%s,procedures_id=%s,
                    subprocedures_id=%s
                 where id=%s

                """,(params['first_name'],params['last_name'],
                     params['leads_status_id'],params['phone'],
                     params['zipcode'],params['email'],
                     params['procedures_id'],params['subprocedures_id'],
                     params['id']
                    )
            )
            db.commit()
        else:
            db.update("""
                insert into leads (first_name,last_name,phone,zipcode,email,procedures_id) values
                    (%s,%s,%s,%s,%s,1000)
                """,(params['first_name'],params['last_name'],
                     params['leads_status_id'],params['phone'],
                     params['zipcode'],params['email'],params['id']
                    )
            )
            insid = db.query("select LAST_INSERT_ID()")
            insid = ins[0]['LAST_INSERT_ID()']
            db.commit()
            params['comments'] = []
            params['comments'].append({'text':"Initial Creation"})

        if 'details' in params:
            j = params['details']
            if 'id' in j:
                db.update("""
                    update leads_patient_details set updated=now(),age=%s,weight=%s,height=%s,addr=%s 
                    where id=%s
                    """,(
                        j['age'],j['weight'],j['height'],json.dumps(j['addr']),
                        j['id']
                    )
                )
            else:
                db.update("""
                    insert into leads_patient_details (leads_id,age,weight,height,addr)
                        values
                    (%s,%s,%s,%s,%s)
                    """,(
                        params['id'], j['age'],j['weight'],j['height'],
                        json.dumps(j['addr'])
                    )
                )
        if 'comments' in params:
            HASH = {}
            for x in params['comments']:
                if 'uuid' not in x:
                    x['uuid'] = encryption.getSHA256()
                if 'id' in x and 'isnew' not in x:
                    db.update(""" 
                        update leads_comments set updated=now(),user_id=%s,text=%s where id=%s
                        """,(user['user_id'],x['text'],x['id'])
                    )
                else:
                    o = db.query("""
                        select id from leads_comments where uuid=%s""",(x['uuid'],)
                    )
                    if len(o) > 0:
                        continue
                    if x['uuid'] in HASH:
                        continue
                    HASH[x['uuid']] = 1
                    db.update(""" 
                        insert into leads_comments (leads_id,user_id,text,uuid) values
                            (%s,%s,%s,%s)
                        """,(insid,user['user_id'],x['text'],x['uuid'])
                    )
        db.update("update leads set updated=now() where id=%s",(insid,));
        db.commit()
        return {'success': True}






