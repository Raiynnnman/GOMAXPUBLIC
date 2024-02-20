# coding=utf-8

import sys
import os
import json
import unittest
import jwt

sys.path.append(os.path.realpath(os.curdir))

from util import encryption
from util.Logging import Logging
from common import settings
from util.DBOps import Query
from processing.SubmitDataRequest import SubmitDataRequest
from processing.Audit import Audit
from common.DataException import DataException
from common.InvalidCredentials import InvalidCredentials
from util.Permissions import check_office
from processing import Office

log = Logging()
config = settings.config()
config.read("settings.cfg")

class BundleBase(SubmitDataRequest):

    def __init__(self):
        super().__init__()

class BundleList(BundleBase):

    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        group_id = user['offices'][0]
        limit = 10000
        offset = 0
        if 'limit' in params:
            limit = int(params['limit'])
        if 'offset' in params:
            offset = int(params['offset'])
        db = Query()
        o = db.query(
            """
            select
               b.id,b.name,b.active,markup,dhd_markup,
                json_arrayagg(
                    json_object(
                        'id',bi.id,'code',bi.code,
                        'assigned',bi.user_id,
                        'desc',bi.description,
                        'office_id',bi.office_id,
                        'price', round(bi.price*markup*dhd_markup,2),
                        'quantity', bi.quantity
                    )
                ) as items
            from
                bundle b
                left outer join bundle_items bi on bi.bundle_id = b.id 
            where
                b.office_id = %s
            group by
                b.id
            """,(group_id,)
        )
        bunds = [] 
        for x in o:
            j = x
            q = db.query("""
                select json_arrayagg(
                    json_object(
                        'user_id',user_id,'changes',changes
                    )
                ) as history
                from bundle_history where bundle_id=%s
            """,(x['id'],))
            j['history'] = []
            if len(q) > 0:
                j['history'] = q[0]["history"]
                if j['history'] is not None:
                    j['history'] = json.loads(j['history'])
                else:
                    j['history'] = []
                
            j['items'] = json.loads(x['items'])
            bunds.append(j)
        u = Office.PhysicianList()
        users = u.execute(*args,**kwargs)
        offices = db.query("""
            select o.id,o.name
            from 
                office o, office_associations oa
            where 
                o.id=oa.to_office_id  and
                oa.from_office_id = %s
            UNION
            select o.id,o.name
            from 
                office o, office_associations oa
            where 
                o.id=oa.to_office_id  and
                o.id = %s
            """,(off_id,off_id))
        ret = {
            'bundles': bunds,
            'users': users,
            'offices': offices
        }
        return ret

class BundleUpdate(BundleBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    def saveBundle(self,params,group_id,db):
        if 'name' not in params or len(params['name']) < 1:
            return { 
                'success': False,
                'message': 'BUNDLE_NAME_REQUIRED'
            } 
        if 'items' not in params or len(params['items']) < 1:
            return { 
                'success': False,
                'message': 'BUNDLE_ITEMS_REQUIRED'
            } 
        if 'markup' not in params: 
            params['markup'] = 1
        if 'cm_code' not in params or params['cm_code'] == 0:
            o = db.query("""
                    select 
                        id
                    from 
                        icd_cm ic,icd_year iy
                    where
                        ic.icd_year_id = iy.id and 
                        code = 'DHD00' and
                        iy.start_date < now() and iy.end_data > now() 
                """,)
            params['cm_code'] = o[0]['id']
        insid = 0
        if 'id' not in params:
            db.update("""
                insert into bundle(name,office_id,icd_cm_id,markup)  values
                    (
                        %s,%s,%s,%s
                    )
            """,(params['name'],group_id,params['cm_code'],params['markup'])
            )
            insid = db.query("select LAST_INSERT_ID()");
            insid = insid[0]['LAST_INSERT_ID()']
            db.commit()
        else:
            db.update("""
                update bundle set updated=now(),
                    name=%s where id = %s
                """,(params['name'],params['id'])
            )
            insid = params['id']
        db.update("delete from bundle_items where bundle_id = %s",(insid,))
        db.commit()
        for x in params['items']:
            if 'office_id' not in x or len(str(x['office_id'])) < 1:
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_ITEM_OFFICE_REQURED'}
            o = db.query("""
                select id from office_associations where to_office_id=%s
                """,(x['office_id'],)
            )
            if len(o) < 1:
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_OFFICE_INVALID'}
            if 'assigned' not in x or len(str(x['assigned'])) < 1:
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_ITEM_ASSIGNMENT_REQURED'}
            if 'desc' not in x or len(x['desc']) < 1:
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_ITEM_DESCRIPTION_REQURED'}
            if 'code' not in x or len(str(x['code'])) < 1:
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_ITEM_CODE_REQURED'}
            if 'quantity' not in x: 
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_ITEM_QUANTITY_REQURED'}
            if 'price' not in x: 
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_ITEM_PRICE_REQURED'}
            try: 
                float(x['price'])
            except:
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_ITEM_PRICE_INVALID'}
            try: 
                int(x['quantity'])
            except:
                db.update("delete from bundle where id=%s",(insid,))
                db.commit()
                return { 'success':False, 'message': 'BUNDLE_ITEM_QUANTITY_INVALID'}
            db.update("""
                insert into 
                    bundle_items(bundle_id,user_id,description,
                    price,code,quantity,office_id,icd_cpt_id) values (%s,%s,%s,%s,%s,%s,%s,%s)
            """,(insid,x['assigned'],x['desc'],x['price'],
                 x['code'],x['quantity'],x['office_id'],x['cpt'])
            )
        db.commit()
        return {'success': True, 'message':'BUNDLE_SAVE_SUCCESS'}

    @check_office
    def execute(self, *args, **kwargs):
        ret = {}
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        group_id = user['offices'][0]
        db = Query()
        if 'upload' not in params:
            ret = self.saveBundle(params,db)
        else:
            pass
        return ret

class BundleCMCodeSearch(BundleBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        if 's' not in params:
            return []
        limit = 10
        if 'limit' in params and not params['limit']:
            limit = 10000
        o = db.query("""
            select 
                ic.id,
                ic.description,
                ic.code
            from 
                icd_cm ic,icd_year iy
            where
                ic.icd_year_id = iy.id and 
                (description like %s or code like %s) and
                iy.start_date < now() and iy.end_date > now() 
            UNION 
            select 
                ic.id,
                ic.description,
                ic.code
            from 
                icd_pcs ic,icd_year iy
            where
                ic.icd_year_id = iy.id and 
                (description like %s or code like %s) and
                iy.start_date < now() and iy.end_date > now() 
            order by code
            limit %s
            """, ('%' + params['s'] + '%','%' + params['s'] + '%',
                '%' + params['s'] + '%','%' + params['s'] + '%',limit
                )
        )
        return o

class BundleCPTCodeSearch(BundleBase):
    def __init__(self):
        super().__init__()

    def isDeferred(self):
        return False

    @check_office
    def execute(self, *args, **kwargs):
        ret = []
        job,user,off_id,params = self.getArgs(*args,**kwargs)
        db = Query()
        if 's' not in params:
            return []
        limit = 10
        if 'limit' in params and not params['limit']:
            limit = 10000
        o = db.query("""
            select 
                ic.id,
                ic.description,
                ic.code
            from 
                icd_cpt ic,icd_year iy
            where
                ic.icd_year_id = iy.id and 
                (description like %s or code like %s) and
                iy.start_date < now() and iy.end_date > now() 
            order by code
            limit %s
            """,('%' + params['s'] + '%','%' + params['s'] + '%',limit)
        )
        return o
    
