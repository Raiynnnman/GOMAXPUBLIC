#!/usr/bin/python

import os
import random
import traceback
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
parser.add_argument('--debug', dest="debug", action="store_true")
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

debug = args.debug

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
    if args.debug:
        print(q)
    PAIN = db.query(q)
else:
    PAIN = db.query(q)

if args.debug:
    print("len=%s" % len(PAIN))

for x in PAIN:
    if x['sf_id'] is not None:
        PAINHASH[x['sf_id']] = x


PSCHEMA = sf_util.getPainSchema(TYPE)

ALL_FIELDS = []
SCHEMA = {}
schema_f = 'sf_leads_schema.json'
data_f = 'sf_leads_data.json'
res = sf_util.cacheOrLoad(schema_f,sf.Lead.describe)
SFSCHEMA = {}
for x in res['fields']:
    # print(x['name'])
    lab = x['label']
    ALL_FIELDS.append(x['name'])
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

ARR.append('Addresses_ID__c')
SFQUERY += ','.join(ARR)
SFQUERY += " from Lead "
if LASTMOD is not None and args.sf_id is None:
    pass
    # SFQUERY += " where ModifiedDate > %s" % LASTMOD
if args.sf_id is not None:
    SFQUERY += " where Id = '%s'" % args.sf_id
if args.debug:
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

SF_ALL_QUERY = "select"
SF_ALL_QUERY += ','.join(ARR)
SF_ALL_QUERY += " from Lead "
res = sf.query_all(SFQUERY)
H=open('lead_backup.json',"w")
H.write(json.dumps(res,indent=4))
H.close()

#---- MAIN

SF_DATA = {}
#print(res)
#print(type(res))
CNTR = 0
IDS = {}
for x in res['records']:
    if args.debug:
        print(json.dumps(x,indent=4))
    SF_ID = x['Id']
    SF_DATA[SF_ID] = x
    # p = x['Phone']
    # p = p.replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
    #if p.startswith("+1"):
    #    p = p.replace("+1","")
    #if p.startswith("1") and len(p) == 11:
    #    p = p[1:]
    if 'attributes' in x:
        del x['attributes']
    v = None
    if x['PainID__c'] in x and x['PainID__c'] is not None:
        v = x['PainID__c']
        IDS[v] = []
    if v is not None:
        IDS[v].append(x['Id'])

for x in IDS:
    if len(IDS[x]) > 1:
        print("%s: WARNING: Detected duplicated PAINIDS: %s" % (x,IDS[x]))
    
random.shuffle(PAIN)
for x in PAIN:
    if debug:
        print("x=%s" % x)
    o = db.query("""
        select count(id) as a from office_addresses where office_id = %s
        """,(x['office_id'],)
    )
    oa_id = 0
    if o[0]['a'] == 0:
        db.update("""
            insert into office_addresses (office_id) value (%s)
            """,(x['office_id'],)
        )
        oa_id = db.query("select LAST_INSERT_ID()")
        oa_id = oa_id[0]['LAST_INSERT_ID()']
    if oa_id == 0:
        g = db.query("""
            select id from office_addresses where office_id=%s
            order by created limit 1
            """,(x['office_id'],)
        )
        x['oa_id'] = g[0]['id']
    SF_ID = x['sf_id']
    SF_ROW = None
    LAST_MOD = None
    if SF_ID in SF_DATA:
        SF_ROW = SF_DATA[SF_ID]
        if debug:
            print("SF_ROW=%s" % json.dumps(SF_ROW))
        LAST_MOD = SF_ROW['LastModifiedDate']
        LAST_MOD = calcdate.parseDate(LAST_MOD).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        if debug:
            print("LAST_MOD:%s" % LAST_MOD)
        SF_DATA[SF_ID]['Addresses_ID__c'] = oa_id
    try:
        x['LastModifiedDate'] = max(x['updated01'],x['updated02'])
    except:
        x['LastModifiedDate'] = x['updated01']

    if x['updated03'] is not None and x['updated03'] > x['LastModifiedDate']:
        x['LastModifiedDate'] = x['updated03']

    if SF_ID is not None and SF_ROW is None:
        print("ERROR: Cached results found, skipping %s" % x['sf_id'])
        continue

    update = 0
    newdata = {}
    try:
        (update,newdata) = sf_util.getPAINData(x,SF_ROW,SFSCHEMA,PSCHEMA,db,debug=args.debug)
    except Exception as e:
        print("%s : ERROR : %s" % (x['office_id'],str(e)))
        print("x=%s" % x)
        print("SF_ROW=%s" % SF_ROW)
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
        db.update("""
            insert into provider_queue_history(provider_queue_id,user_id,text) values (
                %s,1,concat('Error: ',%s)
            )
        """,(x['pq_id'],str(e)))
        continue

    if SF_ID is not None:
        if SF_ID not in PAINHASH:
            PAINHASH[SF_ID] = {}
        PAINHASH[SF_ID]['nd'] = newdata

    if debug:
        print("---- NEWDATA")
        print(json.dumps(newdata,indent=4))
        print("----")
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
    
    if 'PainURL__c' in newdata:
        newdata['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),newdata['PainURL__c'])

    if 'Invoice_Paid__c' in newdata:
        if newdata['Invoice_Paid__c'] == None:
            newdata['Invoice_Paid__c'] = False

    if 'Addresses_ID__c' not in newdata:
            newdata['Addresses_ID__c'] = oa_id

    if "Ready_To_Buy__c" in newdata:
        if newdata['Ready_To_Buy__c'] == None:
            newdata['Ready_To_Buy__c'] = False

    if 'Sales_Link__c' in newdata and 'Subscription_Plan__c' in newdata and newdata['Subscription_Plan__c'] is not None:
        newdata['Sales_Link__c'] = '%s/#/register-provider/%s' % (config.getKey("host_url"),x['pq_id'])

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
    if newdata['Email'] is None:
        newdata['Email'] = "unknown-%s@poundpain.com" % encryption.getSHA256()[:6]
    newdata['Email'] = newdata['Email'].replace(" ",",")
    if newdata['OwnerId'] is None:
        del newdata['OwnerId']

    # print("upd=%s" % update)
    SAME = sf_util.compareDicts(newdata,SF_ROW,debug=args.debug)

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
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Updated SF Date Stamp'
                )
            """,(x['pq_id'],))
            sfid = newdata['Id']
            del newdata['Id']
            if args.only_fields is not None:
                fie = args.only_fields.split(",")
                nd2 = {}
                for f in newdata:
                    if f in fie:
                        nd2[f] = newdata[f]
                newdata = nd2
            if debug:
                print("--- UPDATING TO SF")
                print(json.dumps(newdata,indent=4))
            if not args.dryrun:
                r = sf.Lead.update(sfid,data=newdata)
        else:
            del newdata['Id']
            print("creating SF record:%s " % x['office_name'])
            try:
                if debug:
                    print("---- CREATING TO SF") 
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
                    # print("set3: %s" % j['Id'])
                    db.update("""
                        update provider_queue set sf_id = %s,sf_updated=now() where id = %s
                        """,(r['id'],x['pq_id'])
                    )
                    db.update("""
                        insert into provider_queue_history(provider_queue_id,user_id,text) values (
                            %s,1,'Created SF Lead'
                        )
                    """,(x['pq_id'],))
                if r['Id'] not in PAINHASH:
                    PAINHASH[r['Id']] = {}
                PAINHASH[r['Id']]['newdata'] = newdata
            except Exception as e:
                print(str(e))
                print(json.dumps(newdata,indent=4))
                exc_type, exc_value, exc_traceback = sys.exc_info()
                traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
                raise e
    elif update == sf_util.updatePAIN() and not SAME:
        try:
            if not args.dryrun:
                cmod = sf_util.updatePAINDB(x,SF_ROW,SFSCHEMA,PSCHEMA,db,debug=args.debug)
                if len(cmod) > 0:
                    print("%s: Updating PAIN" % SF_ROW['Id'])
                    for tt in cmod:
                        db.update("""
                            insert into provider_queue_history(provider_queue_id,user_id,text) values (
                                %s,1,%s
                            )
                        """,(x['pq_id'],'SF: Updated field: %s' % tt))
            #db.update("""
            #    update office_addresses set sf_updated=%s where id = %s
            #    """,(LAST_MOD,x['pq_id'],)
            #)
        except Exception as e:
            print("%s : ERROR : %s" % (x['office_id'],str(e)))
            print("newdata=%s" % json.dumps(newdata,indent=4))
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
            continue
    else:
        print("No changes required")
        if x['updated03'] is None:
            if not args.dryrun:
                db.update("""
                    update provider_queue set sf_updated=%s where id = %s
                    """,(LAST_MOD,x['pq_id'],)
                )
                db.update("""
                    insert into provider_queue_history(provider_queue_id,user_id,text) values (
                        %s,1,'Updated SF Datestamp'
                    )
                """,(x['pq_id'],))
    if not args.dryrun:
        db.commit()

    CNTR += 1
    if args.limit is not None and CNTR > int(args.limit):
        break

print("Processing SF Records")

CNTR = 0
for x in SF_DATA:
    j = SF_DATA[x]
    FIELDS = 'PainID__c,PainURL__c,Sales_Link__c,Invoice_Paid__c'
    if j['Email'] is None:
        j['Email'] = "unknown-%s@poundpain.com" % encryption.getSHA256()[:6]
        FIELDS += ",Email"
    off_id = 0
    user_id = 0
    pq_id = 0
    if j['Phone'] is not None:
        p = j['Phone'].replace(")",'').replace("(",'').replace("-",'').replace(" ",'').replace('.','')
        j['Phone'] = p
    if 'attributes' in j:
        del j['attributes']
    sub = None
    if debug:
        print("START---")
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
                    (name,office_type_id,email,billing_system_id,active,import_sf)
                    values
                    (%s,%s,%s,%s,0,1)
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
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Imported from SF'
                )
            """,(pq_id,))
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
            j['PainID__c'] = pq_id
            j['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),pq_id)
            if not args.dryrun:
                try:
                    sf.Lead.update(j['Id'],{
                        'PainID__c': pq_id,
                        'PainURL__c':j['PainURL__c']
                    })
                except Exception as e:
                    print(json.dumps(j))
                    print("%s: ERROR: %s" % (j['Id'],str(e)))
            print("Created office: %s = %s" % (j['Id'],pq_id))
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
                    print(json.dumps(j))
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
            update = False
            t = pq_id
            u = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),pq_id)
            if t != j['PainID__c']:
                update = True
            if u != j['PainURL__c']:
                update = True
            if not update:
                continue
            j['PainID__c'] = t
            j['PainURL__c'] = u
            j['Sales_Link__c'] = '%s/#/register-provider/o/%s' % (config.getKey("host_url"),pq_id)
            o = db.query("""
                select id from provider_queue where office_id = %s
                """,(off_id,)
            )
            if len(o) < 1:
                raise Exception("ERROR: Established off but not in provider queue")
            print("Updating PainID: %s" % j['PainID__c'])
            if not args.dryrun:
                try:
                    sf.Lead.update(j['Id'],{
                        'PainID__c': pq_id,
                        'PainURL__c':j['PainURL__c']
                    })
                except Exception as e:
                    print(json.dumps(j))
                    print("%s: ERROR: %s" % (j['Id'],str(e)))
            # print("set2: %s" % j['Id'])
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
        # Looks silly, but its great for testing
        # print("set1: %s" % j['Id'])
        db.update("""
            update provider_queue set sf_id = %s where id = %s
            """,(j['Id'],int(pq_id))
        )
        if j['Sales_Link__c'] is None:
            u = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),pq_id)
            j['Sales_Link__c'] = '%s/#/register-provider/o/%s' % (config.getKey("host_url"),pq_id)
            j['PainID__c'] = pq_id
            j['PainURL__c'] = u
            if not args.dryrun:
                try:
                    sf.Lead.update(j['Id'],{
                        'PainID__c': pq_id,
                        'PainURL__c':j['PainURL__c'],
                        'Sales_Link__c': j['Sales_Link__c']
                    })
                except Exception as e:
                    print(json.dumps(j))
                    print("%s: ERROR: %s" % (j['Id'],str(e)))
    if debug:
        print("off_id=%s" % off_id)
    if 'Subscription_Plan__c' in j and j['Subscription_Plan__c'] is not None:
        p1 = j['PainID__c']
        if p1 in IDS and len(IDS[p1]) > 1:
            print("%s: Not continuing: duplicates found in leads for PainID" % j['Id'])
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,%s
                )
            """,(pq_id,'Not progressing because multiple SF accounts were found with this ID: %s' % IDS[p1])
            )
            continue
        if j['Status'] == 'New':
            print("%s: Not progressing with status New" % j['Id'])
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Not progressing subscription plan: Status is New'
                )
            """,(pq_id,))
            continue
        if j['Status'] == 'Working':
            print("%s: Not progressing with status Working" % j['Id'])
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Not progressing subscription plan: Status is Working'
                )
            """,(pq_id,))
            continue
        if j['Status'] == 'Converted':
            print("%s: Cant update Converted status" % j['Id'])
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Cant update Converted Status'
                )
            """,(pq_id,))
            continue
        o = db.query("""
            select id,description,duration,price from pricing_data where description = %s
            """,(j['Subscription_Plan__c'],)
        )
        if len(o) < 1:
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Plan wasnt found'
                )
            """,(pq_id,))
            raise Exception("PLAN_NOT_FOUND")
        sub = o[0]
        if debug:
            print("sub=%s" % sub)
        price = sub['price']
        initial_payment = None
        if 'Payment_Amount__c' in j and j['Payment_Amount__c'] is not None and j['Payment_Amount__c'] > 0:
            price = initial_payment = j['Payment_Amount__c']
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Override price from SF'
                )
            """,(pq_id,))
        cur = db.query("""
            select id,pricing_data_id from office_plans where
                office_id = %s
            """,(off_id,)
        )
        if len(cur) > 0:
            i = cur[0]['id']
            cur = cur[0]
            oc = db.query("""
                select pd.description,pq.initial_payment,i.id as invoices_id from
                    office_plans op
                    left join pricing_data pd on op.pricing_data_id=pd.id
                    left join provider_queue pq on pq.office_id = op.office_id
                    left outer join invoices i on i.office_id = op.office_id
                where
                    pq.office_id = op.office_id and
                    op.office_id = %s and 
                    op.pricing_data_id=pd.id
                """,(off_id,)
            )
            UPDATE = True
            if len(oc) > 0:
                u = oc[0]
                if u['description'] == j['Subscription_Plan__c'] and u['initial_payment'] == j['Payment_Amount__c']:
                    UPDATE = False
                    print("%s: Not updating plan as it hasnt changed" % j['Id'])
                if u['invoices_id'] is not None:
                    UPDATE = False
                    print("%s: Not updating plan as its already submitted" % j['Id'])
            if UPDATE:
                print("Replacing office plan")
                db.update("""
                    insert into provider_queue_history(provider_queue_id,user_id,text) values (
                        %s,1,'Replacing plan with update'
                    )
                """,(pq_id,))
                db.update("""
                    delete from office_plan_items where office_plans_id=%s
                    """,(i,)
                )
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
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Creating new plan from SF'
                )
            """,(pq_id,))
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
            if debug:
                print("Updating initial_payment")
            db.update("""
                update provider_queue set initial_payment = %s
                    where office_id = %s
                """,(initial_payment,off_id)
            )
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Override payment amount from SF'
                )
            """,(pq_id,))
        j['Sales_Link__c'] = '%s/#/register-provider/o/%s' % (config.getKey("host_url"),pq_id)
        j['PainURL__c'] = '%s/#/app/main/admin/registrations/%s' % (config.getKey("host_url"),pq_id)
        t = {}
        fie = FIELDS.split(",")
        nd2 = {}
        for f in j:
            if f in fie:
                nd2[f] = j[f]
        t = nd2
        if debug:
            print("t=%s" % t)
        if pq_id == 0:
            raise Exception("PQ_ID = 0")
        if j['Ready_To_Buy__c']:
            b = db.query("""
                select sf_lead_executed from provider_queue where id=%s
                """,(int(pq_id),)
            )
            if not b[0]['sf_lead_executed']:
                print("%s: Customer ready to buy, updating" % j['Id'])
                db.update("""
                    update provider_queue set 
                        sf_lead_executed=1, sf_id = %s,
                        provider_queue_lead_strength_id = %s,
                        provider_queue_status_id = %s
                    where id = %s
                    """,(j['Id'],ST['Preferred Provider'],PQ['INVITED'],int(pq_id))
                )
                db.update("""
                    insert into provider_queue_history(provider_queue_id,user_id,text) values (
                        %s,1,'Sending to invoicing (SF Lead)'
                    )
                """,(pq_id,))
                db.update("""
                    insert into provider_queue_history(provider_queue_id,user_id,text) values (
                        %s,1,'Set to Preferred Provider (SF Lead)'
                    )
                """,(pq_id,))
                db.update("""
                    insert into provider_queue_history(provider_queue_id,user_id,text) values (
                        %s,1,'Set to INVITED (SF Lead)'
                    )
                """,(pq_id,))
                db.update("""
                    update office set 
                        active=1
                    where id = %s
                    """,(off_id,)
                )
                db.update("""
                    insert into office_history(office_id,user_id,text) values (
                        %s,1,'Set to ACTIVE (SF LEAD)'
                    )
                """,(off_id,))
        else:
            db.update("""
                insert into provider_queue_history(provider_queue_id,user_id,text) values (
                    %s,1,'Not sending to invoices, as customer isnt Ready to Buy'
                )
            """,(pq_id,))
        if debug:
            print("---- UPDATE SUBS")
            print(json.dumps(t,indent=4))
        if j['Status'] == 'Converted':
            continue
        if not args.dryrun:
            try:
                sf.Lead.update(x,t)
            except Exception as e:
                print("%s : ERROR : %s" % (x,str(e)))
                exc_type, exc_value, exc_traceback = sys.exc_info()
                traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
    else:
        # print("SF Leads Subscription unnecessary")
        # Looks silly, but when we change environments this really helps
        # print("set4: %s" % j['Id'])
        db.update("""
            update provider_queue set sf_id = %s where id = %s
            """,(j['Id'],int(pq_id))
        )
    db.commit()
    CNTR += 1
    if args.limit is not None and CNTR > int(args.limit):
        break

sf_util.setLastUpdate(TYPE)

