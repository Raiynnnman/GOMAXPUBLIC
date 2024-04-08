#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
from nameparser import HumanName

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs
from salesforce import sf_util

import argparse
from simple_salesforce import Salesforce

config = settings.config()
config.read("settings.cfg")

user = config.getKey("sf_user")
passw = config.getKey("sf_pass")
token = config.getKey("sf_token")
inst = config.getKey("sf_instance")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--sf_id', dest="sf_id", action="store")
parser.add_argument('--limit', dest="limit", action="store")
parser.add_argument('--force_sf', dest="force_sf", action="store_true")
parser.add_argument('--del_dups', dest="del_dups", action="store_true")
args = parser.parse_args()

sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)


db = Query()
PAINHASH = {}
PAIN = db.query("""
    select 
        o.id as office_id,u.id as user_id,pq.sf_id,
        pq.id as pq_id,
        op.id as office_plans_id,pd.id as pricing_data_id,
        o.updated as office_updated,u.updated as users_updated,
        o.name as office_name,
        pq.updated as updated01,pq.updated as updated02,
        pq.sf_updated as updated03,
        com.id as commission_user_id,com.sf_id as user_sf_id
    from 
        provider_queue pq
        left outer join office o on pq.office_id = o.id
        left outer join office_plans op on  op.office_id = o.id
        left outer join pricing_data pd on pd.id = op.pricing_data_id
        left outer join users u on u.id = o.user_id
        left outer join users com on com.id = o.commission_user_id
    where 
        o.active = 0  and o.import_sf = 1 
    """)

for x in PAIN:
    if x['sf_id'] is not None:
        PAINHASH[x['sf_id']] = x

TYPE='Lead'

PSCHEMA = sf_util.getPainSchema(TYPE)

SCHEMA = {}
schema_f = 'sf_leads_schema.json'
data_f = 'sf_leads_data.json'
res = sf_util.cacheOrLoad(schema_f,sf.Lead.describe)
SFSCHEMA = {}
for x in res['fields']:
    # print(x['name'])
    lab = x['label']
    SFSCHEMA[lab] = x
    # print(json.dumps(x,indent=4))
    # print("----")

SFQUERY = "select  "
HAVE={}
ARR = []
for x in PSCHEMA:
    sc = PSCHEMA[x]
    col = sc['sf_field_name']
    # print(col)
    if col not in SFSCHEMA:
        print("WARNING: %s is missing" % col)
        continue
    if col in HAVE:
        print("WARNING: duplicate column %s" % col)
        continue
    HAVE[col] = 1
    sfcol = SFSCHEMA[col]
    # print(sfcol)
    ARR.append(sfcol['name'])

SFQUERY += ','.join(ARR)
SFQUERY += " from Lead "
# print(SFQUERY)

res = []
if os.path.exists(data_f):
    print("Loading %s from disk" % data_f)
    H=open(data_f,"r")
    res = json.loads(H.read())
    H.close()
else:
    res = sf.query_all(SFQUERY)
    H=open(data_f,"w")
    H.write(json.dumps(res,indent=4))
    H.close()


#---- MAIN

SF_DATA = {}
#print(res)
#print(type(res))
CNTR = 0
PHONES = {}
for x in res['records']:
    # print(json.dumps(x,indent=4))
    SF_ID = x['Id']
    SF_DATA[SF_ID] = x
    p = x['Phone']
    if p is None:
        p = x['Email']
    print(x)
    if p is None:
        continue
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p not in PHONES:
        PHONES[p] = []
    
    PHONES[p].append({'Id':x['Id']})

C = 0
for x in PHONES:
    i = PHONES[x]
    TODEL = []
    PD = {}
    if len(i) > 1:
        LOOK = None
        C += 1
        print("Duplicate %s (%s)" % (x,len(i)))
        for g in i:
            v = SF_DATA[g['Id']]
            if v['PainID__c'] is None:
                TODEL.append(v['Id'])
            else:
                k = v['PainID__c']
                q = db.query("""
                    select sf_id from provider_queue where office_id = %s
                    """,(k,)
                )
                if len(q) > 0:
                    q = q[0]['sf_id']
                if k in PD:
                    if v['Id'] != q:
                        TODEL.append(v['Id'])
                PD[k] = 1
            # print(json.dumps(v,sort_keys=True))
        if len(TODEL) == len(i):
            print("No pain ids found")
            LOOK = i[0]
            i.pop()
            for g in i:
                if args.del_dups:
                    sf.Leads.delete(g['Id'])
                else:
                    print("would del %s" % g['Id'])
        else:
            print("TD:%s" % TODEL)
            o = db.query("""
                select office_id from office_addresses where phone = %s
                """,(p,)
            )
            for g in i:
                if args.del_dups:
                    sf.Leads.delete(g['Id'])
                else:
                    print("would del %s" % g['Id'])
        print(p,o)
        
print("DUPS: %s" % C)

random.shuffle(PAIN)
for x in PAIN:
    print(x)
    SF_ID = x['sf_id']
    SF_ROW = None
    LAST_MOD = None
    if SF_ID in SF_DATA:
        SF_ROW = SF_DATA[SF_ID]
        print(json.dumps(SF_ROW))
        LAST_MOD = SF_ROW['LastModifiedDate']
        LAST_MOD = calcdate.parseDate(LAST_MOD).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        print("LAST_MOD:%s" % LAST_MOD)

    try:
        x['LastModifiedDate'] = max(x['updated01'],x['updated02'])
    except:
        x['LastModifiedDate'] = x['updated01']

    if x['updated03'] is not None and x['updated03'] > x['LastModifiedDate']:
        x['LastModifiedDate'] = x['updated03']

    if SF_ID is not None and SF_ROW is None:
        print("ERROR: Cached results found, skipping %s" % x['sf_id'])
        continue

    (update,newdata) = sf_util.getPAINData(x,SF_ROW,SFSCHEMA,PSCHEMA,db)
    #print("----")
    #print(json.dumps(newdata,indent=4))
    #print("----")
    if 'LastModifiedDate' in newdata:
        del newdata['LastModifiedDate']
    if newdata['Company'] is None or len(newdata['Company']) < 1 or newdata['Company'] == "None":
        newdata['Company'] = x['office_name']
    if 'Phone' in newdata and newdata['Phone'] is not None:
        p = newdata['Phone']
        p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
        newdata['Phone'] = p
    
    print("upd=%s" % update)
    SAME = sf_util.compareDicts(newdata,SF_ROW)
    if 'PainURL__c' in newdata:
        newdata['PainURL__c'] = '%s/#/app/main/admin/office/%s' % (config.getKey("host_url"),newdata['PainURL__c'])
    if 'LastName' not in newdata or newdata['LastName'] is None or len(newdata['LastName']) < 2 or newdata['LastName'] == 'Unknown':
        if 'Dr' in newdata['Company'] or 'd.c.' in newdata['Company'].lower() or 'dc' in newdata['Company'].lower():
            t1 = HumanName(newdata['Company'])
            newdata['FirstName'] = "%s %s" % (t1.title,t1.first)
            newdata['LastName'] = "%s %s" % (t1.last,t1.suffix)
        else:
            newdata['LastName'] = 'Unknown'
    if 'FirstName' not in newdata or newdata['FirstName'] is None or len(newdata['FirstName']) < 2:
        newdata['FirstName'] = 'Unknown'
    if 'LastName' not in newdata or newdata['LastName'] is None or len(newdata['LastName']) < 2:
        newdata['LastName'] = 'Unknown'
    newdata['Email'] = newdata['Email'].replace(" ",",")
    if newdata['OwnerId'] is None:
        del newdata['OwnerId']

    if args.force_sf:
        update = sf_util.updateSF()
    
    if update == sf_util.updateSF() and not SAME: # Update SF
        if 'Id' in newdata and newdata['Id'] is not None:
            print("updating SF record: %s" % newdata['Id'])
            print(json.dumps(newdata,indent=4))
            if not args.dryrun:
                db.update("""
                    update provider_queue set sf_updated=now() where id = %s
                    """,(x['pq_id'],)
                )
                sfid = newdata['Id']
                del newdata['Id']
                r = sf.Lead.update(sfid,data=newdata)
        else:
            del newdata['Id']
            print("creating SF record:%s " % x['office_name'])
            try:
                print(json.dumps(newdata,indent=4))
                if not args.dryrun:
                    r = sf.Lead.create(newdata,headers={'Sforce-Duplicate-Rule-Header': 'allowSave=true'})
                    db.update("""
                        update provider_queue set sf_id = %s,sf_updated=now() where id = %s
                        """,(r['id'],x['pq_id'])
                    )
            except Exception as e:
                print(str(e))
                print(json.dumps(newdata,indent=4))
                raise e
    elif False and update == sf_util.updatePAIN() and not SAME:
        print("Updating PAIN")
        try:
            if not args.dryrun:
                sf_util.updatePAINDB(x,SF_ROW,SFSCHEMA,PSCHEMA,db)
            #db.update("""
            #    update office_addresses set sf_updated=%s where id = %s
            #    """,(LAST_MOD,x['pq_id'],)
            #)
        except Exception as e:
            print(str(e))
            print(json.dumps(newdata,indent=4))
            raise e
    else:
        print("No changes required")
        if x['updated03'] is None:
            if not args.dryrun:
                db.update("""
                    update provider_queue set sf_updated=%s where id = %s
                    """,(LAST_MOD,x['pq_id'],)
                )
    if not args.dryrun:
        db.commit()


    if args.limit is not None and CNTR > int(args.limit):
        break
    CNTR += 1

