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
parser.add_argument('--excp_pass', dest="excp_pass", action="store_true")
parser.add_argument('--force_pain', dest="force_pain", action="store_true")
parser.add_argument('--del_dups', dest="del_dups", action="store_true")
parser.add_argument('--doall', dest="do_all", action="store_true")
parser.add_argument('--only_fields', dest="only_fields", action="store")
parser.add_argument('--no_new', dest="no_new", action="store_true")
args = parser.parse_args()

sf = None
if config.getKey("sf_test"):
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst,domain='test')
else:
    sf = Salesforce(security_token=token, password=passw, username=user, instance=inst)

TYPE='Lead'

PQ = getIDs.getProviderQueueStatus()
ST = getIDs.getLeadStrength()
OT = getIDs.getOfficeTypes()

db = Query()
PAINHASH = {}
LASTMOD = None
if not args.do_all:
    LASTMOD = sf_util.getLastUpdate(TYPE)
if args.sf_id is not None:
    LASTMOD = None

PAIN = []

q = """
    select 
        o.id as office_id,u.id as user_id,pq.sf_id,
        pq.id as pq_id,o.active,
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
        o.import_sf = 1 
    """

BS = getIDs.getBillingSystem()

#if LASTMOD is not None and args.sf_id is None:
#    q += " and (pq.updated > %s or pq.sf_updated > %s) " 
#    PAIN = db.query(q,(LASTMOD,LASTMOD))
if args.sf_id is not None:
    q += " and pq.sf_id = '%s'" % args.sf_id
    print(q)
    PAIN = db.query(q)
else:
    PAIN = db.query(q)

print(len(PAIN))

for x in PAIN:
    if x['sf_id'] is not None:
        PAINHASH[x['sf_id']] = x


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
if LASTMOD is not None and args.sf_id is None:
    pass
    # SFQUERY += " where ModifiedDate > %s" % LASTMOD
if args.sf_id is not None:
    SFQUERY += " where Id = '%s'" % args.sf_id
print(SFQUERY)

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
    if p is None:
        continue
    p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    if p.startswith("+1"):
        p = p.replace("+1","")
    if p.startswith("1") and len(p) == 11:
        p = p[1:]
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
        if p.startswith("+1"):
            p = p.replace("+1","")
        if p.startswith("1") and len(p) == 11:
            p = p[1:]
        newdata['Phone'] = p
    
    print("upd=%s" % update)
    SAME = sf_util.compareDicts(newdata,SF_ROW)
    if 'PainURL__c' in newdata:
        newdata['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),newdata['PainURL__c'])
    if 'Sales_URL__c' in newdata and 'Subscription_Plan__c' in newdata and newdata['Subscription_Plan__c'] is not None:
        # newdata['Sales_URL__c'] = '%s/#/register-provider/%s' % (config.getKey("host_url"),x['office_id'])
        # On hold
        print("Subplan %s" % newdata['Sales_URL__c'])
        del newdata['Sales_URL__c']
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
    if args.force_pain:
        update = sf_util.updatePAIN()
    
    if update == sf_util.updateSF() and not SAME: # Update SF
        if 'Id' in newdata and newdata['Id'] is not None:
            PAINHASH[newdata['Id']]['newdata'] = newdata
            print("updating SF record: %s" % newdata['Id'])
            db.update("""
                update provider_queue set sf_updated=now() where id = %s
                """,(x['pq_id'],)
            )
            sfid = newdata['Id']
            del newdata['Id']
            if args.only_fields is not None:
                fie = args.only_fields.split(",")
                nd2 = {}
                for f in newdata:
                    if f in fie:
                        nd2[f] = newdata[f]
                newdata = nd2
            print(json.dumps(newdata,indent=4))
            if not args.dryrun:
                r = sf.Lead.update(sfid,data=newdata)
        else:
            del newdata['Id']
            print("creating SF record:%s " % x['office_name'])
            try:
                print(json.dumps(newdata,indent=4))
                if 'Phone' in newdata and newdata['Phone'] is not None:
                    o = db.query("""
                        select pq.id as t1 from office_addresses oa,office o,provider_queue pq  
                            where oa.office_id = o.id and pq.office_id=o.id and oa.phone = %s
                        """,(newdata['Phone'],)
                    )
                    if len(o) > 0:
                        raise Exception("ERROR: Creating new record but phone found: %s (%s)" % (newdata['Phone'],o[0]['t1']))
                if not args.dryrun and not args.no_new:
                    r = sf.Lead.create(newdata)
                    db.update("""
                        update provider_queue set sf_id = %s,sf_updated=now() where id = %s
                        """,(r['id'],x['pq_id'])
                    )
                if r['Id'] not in PAINHASH:
                    PAINHASH[r['Id']] = {}
                PAINHASH[r['Id']]['newdata'] = newdata
            except Exception as e:
                print(str(e))
                print(json.dumps(newdata,indent=4))
                raise e
    elif update == sf_util.updatePAIN() and not SAME:
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

    CNTR += 1
    if args.limit is not None and CNTR > int(args.limit):
        break

CNTR = 0
for x in SF_DATA:
    j = SF_DATA[x]
    if j['Email'] is None:
        print("Record %s has no email, skipping" % j['Id'])
        continue
    off_id = 0
    user_id = 0
    pq_id = 0
    if j['Phone'] is not None:
        p = j['Phone'].replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
        j['Phone'] = p
    if 'attributes' in j:
        del j['attributes']
    sub = None
    #print("START---")
    print(json.dumps(j))
    if j['PainID__c'] is None:
        o = db.query("""
            select pq.id as t1 from office_addresses oa,office o,provider_queue pq  
                where oa.office_id = o.id and pq.office_id=o.id and oa.phone = %s
            UNION ALL
            select pq.id as t1 from office_user ou,users u,provider_queue pq 
                where ou.user_id = u.id and u.email = %s and pq.office_id=ou.office_id
            UNION ALL
            select pq.id as t1 from office o,provider_queue pq 
                where o.email = %s and o.id=pq.office_id
            UNION ALL
            select id as t1 from provider_queue where sf_id = %s
            """,(j['Phone'],j['Email'],j['Email'],j['Id'])
        )
        if len(o) < 1:
            print("Need to create office for %s" % j['Id'])
            db.update("""
                insert into office 
                    (name,office_type_id,email,billing_system_id,active)
                    values
                    (%s,%s,%s,%s,0)
                """,(j['Company'],OT['Chiropractor'],j['Email'].lower(),BS)
            )
            off_id = db.query("select LAST_INSERT_ID()")
            off_id = off_id[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_addresses
                    (office_id,addr1,phone,city,state,zipcode,name) 
                    values 
                    (%s,%s,%s,%s,%s,%s,%s)
                """,(
                    off_id,
                    j['Street'] if 'Street' in j else '',
                    j['Phone'] if 'Phone' in j else '',
                    j['City'] if 'City' in j else '',
                    j['State'] if 'State' in j else '',
                    j['PostalCode'] if 'PostalCode' in j else '',
                    j['Company'] 
                    )
            )
            db.update("""
            insert into provider_queue(
                    office_id,provider_queue_status_id,provider_queue_lead_strength_id,
                    website
                ) 
                values (%s,%s,%s,%s)
            """,(
                off_id,PQ['QUEUED'],ST['Potential Provider'],
                j['Website']
                )
            )
            pq_id = db.query("select LAST_INSERT_ID()")
            pq_id = pq_id[0]['LAST_INSERT_ID()']
            j['PainID__c'] = pq_id
            db.update("""
                insert into users(email,first_name,last_name,phone,active) 
                    values (lower(%s),%s,%s,%s,0)
            """,(
                j['Email'].lower(),j['FirstName'],j['LastName'],
                j['Phone']
                )
            )
            user_id = db.query("select LAST_INSERT_ID()")
            user_id = user_id[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_user(user_id,office_id) 
                    values (%s,%s)
            """,(
                user_id,off_id
                )
            )
            db.update("""
                insert into user_entitlements(user_id,entitlements_id) values 
                (%s,3),
                (%s,7)
                """,(user_id,user_id)
            )
            db.update("""
                insert into user_permissions(user_id,permissions_id) values 
                (%s,1)
                """,(user_id,)
            )
        elif len(o) > 1:
            l = {}
            print(o)
            for gg in o:
                v = gg['t1']
                l[v] = 1
            if len(l) > 1:
                print("Need to review record for %s" % j['Id'])
                continue
            pq_id = o[0]['t1']
            off_id = db.query("""
                select office_id from provider_queue where id = %s
                """,(pq_id,)
            )
            if len(off_id) < 1:
                raise Exception("PQ given, office not found")
            off_id = off_id[0]['office_id']
            j['PainID__c'] = pq_id
            j['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),pq_id)
            print("Found %s (%s)" % (j['Id'],pq_id))
            if not args.dryrun:
                try:
                    sf.Lead.update(j['Id'],{
                        'PainID__c': o[0]['t1'],
                        'PainURL__c':j['PainURL__c']
                    })
                except Exception as e:
                    print("%s: ERROR: %s" % (j['Id'],str(e)))
        else:
            pq_id = o[0]['t1']
            print("Found pq %s" % pq_id)
            off_id = db.query("""
                select office_id from provider_queue where id = %s
                """,(pq_id,)
            )
            if len(off_id) < 1:
                raise Exception("PQ given, office not found")
            off_id = off_id[0]['office_id']
            j['PainID__c'] = pq_id
            j['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),pq_id)
            o = db.query("""
                select id from provider_queue where office_id = %s
                """,(off_id,)
            )
            if len(o) < 1:
                raise Exception("ERROR: Established off but not in provider queue")
            print("Updating null PainID: %s" % j['PainID__c'])
            if not args.dryrun:
                try:
                    sf.Lead.update(j['Id'],{
                        'PainID__c': pq_id,
                        'PainURL__c':j['PainURL__c']
                    })
                except Exception as e:
                    print("%s: ERROR: %s" % (j['Id'],str(e)))
            db.update("""
                update provider_queue set sf_id = %s where id = %s
                """,(j['Id'],int(pq_id))
            )
    else:
        pq_id = int(j['PainID__c'])
        off_id = db.query("""
            select office_id from provider_queue where id = %s
            """,(pq_id,)
        )
        off_id2 = db.query("""
            select id from office where id = %s
            """,(pq_id,)
        )
        if len(off_id) < 1 and len(off_id2) < 1:
            if not args.excp_pass:
                raise Exception("PQ given, office not found: %s" % pq_id)
            else:
                print("PQ given, office not found: %s" % pq_id)
                continue
        elif len(off_id) < 1 and len(off_id2) > 0:
            if not args.excp_pass:
                raise Exception("PQ given, office not found: %s" % pq_id)
            else:
                raise Exception("PQ given, office found instead: %s" % pq_id)
        else:
            off_id = off_id[0]['office_id']
    print("off_id=%s" % off_id)
    if 'Subscription_Plan__c' in j and j['Subscription_Plan__c'] is not None:
        o = db.query("""
            select id,description,duration,price from pricing_data where description = %s
            """,(j['Subscription_Plan__c'],)
        )
        if len(o) < 1:
            raise Exception("PLAN_NOT_FOUND")
        sub = o[0]
        print(sub)
        price = sub['price']
        initial_payment = None
        if 'Payment_Amount__c' in j and j['Payment_Amount__c'] is not None and j['Payment_Amount__c'] > 0:
            price = initial_payment = j['Payment_Amount__c']
        cur = db.query("""
            select id,pricing_data_id from office_plans where
                office_id = %s
            """,(off_id,)
        )
        if len(cur) > 0:
            print("Replacing office plan")
            i = cur[0]['id']
            cur = cur[0]
            db.update("""
                delete from office_plan_items where office_plans_id=%s
                """,(i,)
            )
            print("dur",sub['duration'])
            db.update("""
                update office_plans set 
                    pricing_data_id = %s,
                    start_date = now(),
                    end_date = date_add(now(),INTERVAL %s MONTH)
                where
                    id = %s
                """,(sub['id'],sub['duration'],cur['id'])
            )
            db.update("""
                insert into office_plan_items 
                    (office_plans_id,price,description,quantity)
                values
                    (%s,%s,%s,%s)
                """,(i,price,sub['description'],1)
            )
            if initial_payment is not None:
                db.update("""
                    update provider_queue set initial_payment = %s
                        where office_id = %s
                    """,(initial_payment,off_id)
                )
        else:
            print("Creating new office plan")
            db.update("""
                insert into office_plans
                    (office_id,start_date,end_date,pricing_data_id)
                values
                    (%s,now(),date_add(now(), INTERVAL %s MONTH),%s)
                """,(off_id,sub['duration'],sub['id'])
            )
            newpid = db.query("select LAST_INSERT_ID()")
            newpid = newpid[0]['LAST_INSERT_ID()']
            db.update("""
                insert into office_plan_items 
                    (office_plans_id,price,description,quantity)
                values
                    (%s,%s,%s,%s)
                """,(newpid,price,sub['description'],1)
            )
        if initial_payment is not None:
            db.update("""
                update provider_queue set initial_payment = %s
                    where office_id = %s
                """,(initial_payment,off_id)
            )
        j['Sales_URL__c'] = '%s/#/register-provider/o/%s' % (config.getKey("host_url"),pq_id)
        j['PainURL__c'] = '%s/#/app/main/admin/office/%s' % (config.getKey("host_url"),pq_id)
        # Dont auto move for now, wait for payment
        #if j['Status'] == 'Converted':
        #    print("Moving to converted status")
        #    db.update("""
        #        update provider_queue set status = %s where office_id = %s
        #        """,(PQ['INVITED'],off_id)
        #    )
        #    db.update("""
        #        update office set active = 1 where id = %s
        #        """,(off_id,)
        #    )
        t = {}
        fie = args.only_fields.split(",")
        nd2 = {}
        for f in j:
            if f in fie:
                nd2[f] = j[f]
        t = nd2
        if pq_id == 0:
            raise Exception("PQ_ID = 0")
        if 'Invoice_Paid__c' in t:
            if x in PAINHASH:
                b = PAINHASH[x]
                print(b)
        db.update("""
            update provider_queue set sf_id = %s where id = %s
            """,(j['Id'],int(pq_id))
        )
        if not args.dryrun:
            try:
                sf.Lead.update(x,t)
            except Exception as e:
                print("%s : ERROR : %s" % (x,str(e)))
        print(json.dumps(t,indent=4))
    else:
        print("SF Leads Subscription unnecessary")
        # Looks silly, but when we change environments this really helps
        db.update("""
            update provider_queue set sf_id = %s where id = %s
            """,(j['Id'],int(pq_id))
        )
    db.commit()
    CNTR += 1
    if args.limit is not None and CNTR > int(args.limit):
        break

sf_util.setLastUpdate(TYPE)

