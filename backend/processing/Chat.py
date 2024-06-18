# coding=utf-8

import sys
import os
import json
import unittest
import jwt

from util import encryption
from util.Logging import Logging
from common import settings
from util.UploadDocument import uploadDocument
from util import S3Processing
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_office

log = Logging()
config = settings.config()
config.read("settings.cfg")

class ChatBase(SubmitDataRequest):

    def __init__(self):
        super().__init__()

class GetOfficeChat(ChatBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = {
            "rooms":[],
            "users":[],
        }
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        ENT = self.getEntitlementIDs()
        o = db.query("""
            select /* Customer */
                u.id,first_name,last_name,title,email,0 as is_user,
                ps.id as appt_id
            from
                users u,
                physician_schedule_scheduled pss,
                physician_schedule ps
            where
                ps.user_id=u.id and
                ps.id = pss.physician_schedule_id and
                u.id = %s
            UNION
            select /* Physician */
                u.id,first_name,last_name,title,email,1 as is_user,
                ps.id as appt_id
            from
                users u,
                physician_schedule_scheduled pss,
                physician_schedule ps
            where
                pss.user_id=u.id and
                ps.id = pss.physician_schedule_id and
                u.id = %s
            UNION
            select /* Office Users */
                u.id,first_name,last_name,title,email,2 as is_user,
                ps.id as appt_id
            from
                users u, office o,
                office_user ou,
                physician_schedule_scheduled pss,
                physician_schedule ps
            where
                o.id = ou.office_id and
                ps.user_id = ou.user_id and
                pss.user_id=u.id and
                ps.id = pss.physician_schedule_id and
                o.id = %s
            UNION
            select /* Admin Users */
                u.id,first_name,last_name,title,email,3 as is_user,
                0 as appt_id
            from
                users u 
            where
                u.id in (select user_id from user_entitlements where
                            entitlements_id=%s)
            """,(user['user_id'],user['user_id'],off_id,ENT['Admin'])
        )
        ret['users'] = []
        H = {}
        for x in o:
            if x['email'] in H:
                continue
            H[x['email']] = 1
            ret['users'].append(x)
        o = db.query("""
            select
                cr.name as room_name, 
                cr.label as label,
                cr.id,
                json_object(
                    'id',ps.id,
                    'phy_id',ps.user_id,
                    'procedure',s.name,
                    'first_name',u.first_name,
                    'last_name', u.last_name,
                    'title', u.title,
                    'status',ast.name,
                    'day',ps.day,
                    'day_formatted', date_format(ps.day,'%b %d'),
                    'time_formatted', time_format(ps.time,'%h:%i%p'),
                    'time', ps.time
                ) as appt
            from
                chat_rooms cr 
                left join chat_room_invited cri on cr.id=cri.chat_rooms_id
                left join physician_schedule ps on cr.physician_schedule_id = ps.id
                left join physician_schedule_scheduled pss on pss.physician_schedule_id = ps.id
                left join appt_status ast on ast.id = pss.appt_status_id
                left join subprocedures s on s.id = pss.subprocedures_id
                left outer join chat_room_discussions crd on cr.id=crd.chat_rooms_id
                left join office_user ou on ou.user_id=ps.user_id 
                left join office o on ou.office_id = o.id 
                left join users u on u.id = pss.user_id
            where 
                o.id = %s
            group by 
                cr.id
            """,(off_id,)
        )
        ret['rooms'] = []
        for x in o:
            doc = db.query("""
                select 
                    uud.id,description
                from 
                    user_upload_documents uud,
                    user_upload_email uue,
                    chat_rooms cr,
                    physician_schedule ps,
                    physician_schedule_scheduled pss
                where
                    uud.user_upload_email_id = uue.id and
                    cr.physician_schedule_id = ps.id and
                    ps.id = pss.physician_schedule_id and 
                    uue.user_id = pss.user_id and 
                    cr.id = %s and 
                    uue.office_id = %s        
                """,(x['id'],off_id,)
            )
            x['documents'] = doc
            ch = db.query("""
                select
                    crd.id,
                    crd.from_user_id,
                    crd.to_user_id,
                    crd.text,
                    u.first_name,
                    u.last_name,
                    u.title,
                    crd.created
                from 
                    chat_rooms cr,
                    chat_room_discussions crd, 
                    users u
                where
                   crd.chat_rooms_id = cr.id and
                   u.id = crd.from_user_id and
                   cr.id = %s 
                """,(x['id'],)
            )
            x['appt'] = json.loads(x['appt'])
            # from the office perspective, show username
            x['label'] = "%s@%s - %s %s" % (
                    x['appt']['day_formatted'],
                    x['appt']['time_formatted'],
                    x['appt']['first_name'],x['appt']['last_name']
                )
            x['chats'] = ch
            ret['rooms'].append(x)
        return ret

class GetCustChat(ChatBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {
            "rooms":[],
            "users":[],
        }
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        print(params)
        db = Query()
        ENT = self.getEntitlementIDs()
        if 'appt' not in params or params['appt'] is None:
            return ret
        d = db.query("""
            select office_id from client_intake_offices
                where id = %s
            """,(params['appt'],)
        )
        if len(d) < 1:
            return ret
        dest_off = d[0]['office_id']
        o = db.query("""
            select /* Office */
                o.id,o.name,0 as is_user
            from
                office o
            where
                o.id = %s
            UNION
            select  /* The user */
                u.id,concat(first_name,' ',last_name),1 as is_user
            from
                users u
            where
                u.id = %s
            UNION
            select /* Admin Users */
                u.id,concat(first_name,' ',last_name),2 as is_user
            from
                users u 
            where
                u.id in (select user_id from user_entitlements where
                            entitlements_id=%s) 
            """,(dest_off,user['user_id'],ENT['Admin'])
        )
        ret['users'] = o
        o = db.query("""
            select
                cr.name as room_name,
                cr.label as label,
                cr.id
            from
                chat_rooms cr
                left join chat_room_invited cri on cr.id=cri.chat_rooms_id
            where 
               cri.user_id = %s 
            """,(user['user_id'],)
        )
        ret['rooms'] = []
        for x in o:
            x['appt'] = json.loads(x['appt'])
            doc = db.query("""
                select 
                    uud.id,description
                from 
                    user_upload_documents uud,
                    user_upload_email uue,
                    chat_rooms cr,
                    office o, office_user ou
                where
                    o.id = ou.office_id and
                    uud.user_upload_email_id = uue.id and
                    uue.user_id = pss.user_id and 
                    cr.id = %s and
                    uue.user_id = %s
                """,(x['id'],user['user_id'],)
            )
            x['documents'] = doc
            ch = db.query("""
                select
                    crd.id,
                    crd.from_user_id,
                    crd.to_user_id,
                    crd.text,
                    u.first_name,
                    u.last_name,
                    u.title,
                    crd.created
                from 
                    chat_room_discussions crd, users u,
                    chat_room_invited cri
                where 
                    cri.user_id = u.id and 
                    cri.chat_rooms_id = crd.chat_rooms_id and
                    crd.user_id = u.id and 
                    crd.chat_rooms_id = %s
                order by
                    crd.created desc
                """,(x['id'],)
            )
            x['chats'] = ch
            ret['rooms'].append(x)
        return ret

class CreateRoom(ChatBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        # TODO: Make sure that the to in the following has reason to create a chat
        o = db.query("""
            select 
                s.name as proc,
                date_format(ps.day,'%b %d') as day,
                time_format(ps.time,'%h:%i%p') as time,
                u.title,u.first_name,u.last_name,
                pss.office_id
            from 
                physician_schedule ps, physician_schedule_scheduled pss,
                subprocedures s, users u
            where
                ps.user_id = u.id and 
                s.id = pss.subprocedures_id and
                pss.physician_schedule_id = ps.id and
                ps.id = %s
            """,(params['appt_id'],)
        )
        if len(o) < 1:
            raise Exception("ERROR: appt %s not found",params['appt_id'])
        roomName = "room-apt-%s" % (params['appt_id'],)
        label = "%s@%s - %s %s" % (
            o[0]['day'],o[0]['time'],o[0]['title'],o[0]['last_name']
        )
        chats = db.query("""
            select id from chat_rooms where name=%s
            """, (roomName,)
        )
        if len(chats) > 0:
            ret['success'] = True # Dont return false here since UI depends on it
            ret['message'] = "ROOM_ALREADY_EXISTS"
            ret['room_id'] = chats[0]['id']
            return ret
        db.update("""
            insert into chat_rooms (name,physician_schedule_id,label,office_id) values 
                (%s,%s,%s,%s)
            """,(roomName,params['appt_id'],label,o[0]['office_id'])
        )
        db.commit()
        insid = db.query("select LAST_INSERT_ID()");
        insid = insid[0]['LAST_INSERT_ID()']
        db.update("""
            insert into chat_room_invited (chat_rooms_id,user_id) values
            (%s,%s),(%s,%s)
            """,(insid,params['to'],insid,user['user_id'])
        )
            
        db.commit()
        ret['success'] = True
        ret['room_id'] = insid
        return ret


class UploadDocumentFromRoom(ChatBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        if 'appt_id' not in params:
            raise Exception('APPOINTMENT_REQUIRED')
        user_id = user['user_id']
        appt_id = params['appt_id']
        o = db.query("""
            select
                o.id as office_id,
                uue.id as uueid
            from
                office o,physician_schedule_scheduled pss,
                user_upload_email uue, physician_schedule ps, 
                office_user ou 
            where 
                o.id=ou.office_id and ps.user_id=ou.user_id and 
                uue.user_id=pss.user_id and 
                ps.id=pss.physician_schedule_id and 
                ps.id = %s 
            """,(appt_id,)
        )
        # TODO: Handle if there is no user_upload_email
        if len(o) < 1:
            raise Exception('USER_UPLOAD_MISSING')
        office_id = o[0]['office_id']
        uueid = o[0]['uueid']
        if 'content' not in params:
            raise Exception('CONTENT_REQUIRED')
        for x in params['content']:
            uploadDocument(office_id,user['user_id'],uueid,x,'Uploaded via chat')            
        ret['success'] = True
        return ret

class DownloadDocumentFromRoom(ChatBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        bucket = config.getKey("document_bucket")
        aws_user = config.getKey("document_bucket_access_key")
        aws_pass = config.getKey("document_bucket_access_secret")
        db = Query()
        appt_id = 0
        if 'appt_id' in params:
            appt_id = params['appt_id']
        o = db.query("""
            select 
                mimetype,blob_path 
            from
                user_upload_documents uud,user_upload_email uue,
                office_user ou, physician_schedule ps
            where
                ou.user_id = ps.user_id and
                uud.user_upload_email_id = uue.id and
                uue.office_id = ou.office_id and 
                ps.id = %s and 
                uud.id = %s
            """,(appt_id,params['id'])
        )
        for x in o:
            blob_path = x['blob_path']
            content = S3Processing.downloadS3ItemFromBucket(
                aws_user,aws_pass,bucket,blob_path)
            b = encryption.decrypt(content.decode('utf-8'),config.getKey("encryption_key"))
            ret['content'] = b
            ret['filename'] = os.path.basename(blob_path)
            ret['filename'] = ret['filename'].replace('.enc','')
        return ret
