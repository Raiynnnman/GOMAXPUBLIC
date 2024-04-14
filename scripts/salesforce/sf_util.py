import os
import sys
from datetime import datetime, timedelta
import time
import json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs

def getPainSchema(TYPE):
    db = Query()
    l = db.query("""
        select 
            sf_table_schema,sf_field_name,
            pain_table_name,pain_field_name,pain_special_filter,
            pain_join_col,include_in_update,include_in_back_sync
        from 
            salesforce_mapping
        where 
            sf_table_schema = %s
        """,(TYPE,)
    )
    t = {}
    for x in l:
        col = x['sf_field_name']
        t[col] = x
    return t

def cacheOrLoad(fname,obj):
    res = None
    if os.path.exists(fname):
        H=open(fname,"r")
        res = json.loads(H.read())
        H.close()
    else:
        res = obj()
        H=open(fname,"w")
        H.write(json.dumps(res,indent=4))
        H.close()
    return res

def compareDicts(sf,pain):
    sf1 = {}
    pain1 = {}
    for t in sf:
        sf1[t] = str(sf[t])
    for t in pain:
        pain1[t] = str(pain[t])
    sdata = json.dumps(sf1,sort_keys=True)
    pdata = json.dumps(pain1,sort_keys=True)
    psha = encryption.getSHA256(pdata)
    ssha = encryption.getSHA256(sdata)
    #print("p=%s" % pdata)
    #print("s=%s" % sdata)
    #print("p-%s = sf-%s" % (psha,ssha))
    if psha != ssha:
        return False
    return True

def updatePAIN():
    return 0

def updateSF():
    return 1

def updatePAINDB(prow,srow,sfschema,pschema,db,debug=False):
    com_user = {}
    cols_mod = []
    o = db.query("select id,sf_id from users where sf_id is not null")
    for g in o:
        com_user[g['sf_id']] = g['id']
    oldvalues = getPAINData(prow,srow,sfschema,pschema,db)
    oldvalues = oldvalues[1]
    if 'attributes' in srow:
        del srow['attributes']
    if debug:
        print("p=%s" % json.dumps(prow,sort_keys=True))
        print("s=%s" % json.dumps(srow,sort_keys=True))
        print("o=%s" % json.dumps(oldvalues,sort_keys=True))
    for x in srow:
        pcol = None
        for t in sfschema:
            if sfschema[t]['name'] == x:
                v = sfschema[t]['label']
                pcol = pschema[v]
        if pcol is None:
            raise Exception("Column %s not found in schema" % x)
        if not pcol['include_in_back_sync']:
            if debug:
                print("Skipping field %s, not in back sync" % x)
            continue
        field = pcol['pain_field_name']
        table = pcol['pain_table_name']
        filt = pcol['pain_special_filter']
        join = pcol['pain_join_col']
        newval = srow[x]
        oldval = oldvalues[x]
        if newval == oldval:
            if debug:
                print("Field %s (%s/%s) identical, skip" % (x,newval,oldval))
            continue
        cols_mod.append(field)
        if debug:
            print('comp: %s=%s' % (oldval,newval))
            print(x)
            print("pcol=%s" % pcol)
        if len(join) < 1:
            join = 'id'
        val = 0
        if '.' in join:
            j = join.split('.')
            val = prow[j[1]]
        else:
            val = prow[join]
        if join == 'oa_id':
            join = 'id'
        if val == None:
            val = 0
        COMM = False
        if join == 'commission_user_id':
            COMM = True
            join = 'id'
            val = prow['office_id']
            if newval not in com_user:
                raise Exception("User %s Missing!" % newval)
            newval = com_user[newval]
        ftable = table
        jtable = table
        if ',' in ftable:
            j = table
            ftable = j.split(',')[1]
            jtable = j.split(',')[0]
        if ftable=='users' and join =='user_id':
            join = 'id'
        if ftable=='office_addresses' and field =='website':
            ftable = 'provider_queue'
        if ftable=='office' and join =='office_id':
            join = 'id'
        if COMM:
            ftable = 'office'
        q = """
             update %s set %s=** where %s.%s = %s 
        """ % (ftable,field,ftable,join,val)
        q = q.replace("**","%s")
        if debug:
            print(q,newval)
        db.update(q,(newval,))
        return cols_mod

def getPAINData(prow,srow,sfschema,pschema,db,debug=False):
    # print(json.dumps(prow,indent=4))
    com_user = {}
    o = db.query("select id,sf_id from users where sf_id is not null")
    for g in o:
        com_user[g['id']] = g['sf_id']
    upd = updateSF() # default to SF (plat is system of record)
    ret = {}
    sfmod = None
    if srow is not None and 'LastModifiedDate' in srow:
        sfmod = srow['LastModifiedDate']
    ret['LastModifiedDate'] = pmod = prow['LastModifiedDate']
    if sfmod is None:
        upd = updateSF()
    else:
        p = calcdate.parseDate(pmod)
        s = calcdate.parseDate(sfmod)
        if debug:
            print("p=%s" % p)
            print("s=%s" % s)
        if p > s:
            upd = updateSF()
            print("Picking sf because p.updated > s.updated")
        if s > p:
            print("Picking pain because s.updated > p.updated")
            upd = updatePAIN()
    for y in pschema:
        if not pschema[y]['include_in_update']:
            continue
        SFFIELD = pschema[y]['sf_field_name']
        if y not in sfschema:
            raise Exception('"%s" missing from SF schema' % y)
        TYPE = sfschema[y]['type']
        SFCOLNAME = sfschema[y]['name']
        if debug:
            print(pschema[y])
            print(json.dumps(sfschema[y]))
            print(prow)
        field = pschema[y]['pain_field_name']
        table = pschema[y]['pain_table_name']
        filt = pschema[y]['pain_special_filter']
        join = pschema[y]['pain_join_col']
        if len(join) < 1:
            join = 'id'
        val = 0
        if join == 'oa_id':
            join = 'id'
        if '.' in join:
            j = join.split('.')
            val = prow[j[1]]
        else:
            val = prow[join]
        COMM = False
        if join == 'commission_user_id':
            COMM = True
            join = 'id'
        if val == None:
            val = 0
        ftable = table
        jtable = table
        if ',' in ftable:
            j = table
            ftable = j.split(',')[0]
            jtable = j.split(',')[1]
        if join == "user_id" and jtable == 'users':
            join = "id"
        if join == "office_id" and jtable == 'office':
            join = "id"
        if 'zipcode' in field.lower() or 'postalcode' in field.lower():
            # Convert zipcodes incase they have the .0 in them
            if val is not None:
                val = str(int(val))

        q = """
            select %s.%s as s,%s.updated as u,%s.id as i from %s where %s.%s = %s %s
        """ % (ftable,field,ftable,ftable,table,jtable,join,val,filt)
        if COMM:
            q += " and office.id = %s " % prow['office_id']
        if 'office_plans' in pschema[y]['pain_field_name']:
            q += " and office.id = %s " % prow['office_id']
        if debug:
            print("q=%s" % q)
        o = db.query(q)
        if len(o) > 1:
            print(o)
            raise Exception("query returned more than one result")
        v = None
        if len(o) > 0:
            v = o[0]['s']
            if COMM:
                v = com_user[v]
            if v == None:
                v = None
            elif TYPE == 'string':
                v = str(v)
            elif TYPE == 'double':
                v = float(v)
            elif TYPE == 'boolean':
                if v:
                    v=True
                else:
                    v=False
        ret[SFCOLNAME] = v
        if debug:
            print("-----")

    return (upd,ret)


def compareDicts(n,f,debug=False):
    if n is None:
        return False
    if f is None:
        return False
    n = json.loads(json.dumps(n))
    f = json.loads(json.dumps(f))
    if  'LastModifiedDate' in n:
        pmod = n['LastModifiedDate']
        del n['LastModifiedDate']
    if  'LastModifiedDate' in f:
        sfmod = f['LastModifiedDate']
        del f['LastModifiedDate']
    ret = True
    if 'IsActive' in n:
        if n['IsActive']:
            n['IsActive'] = True
        else:
            n['IsActive'] = False
    for x in n:
        if x not in f:
            print("%s wasnt in f" % x)
            ret = False
            break
        if isinstance(f[x],bool):
            #print("changing bool")
            if n[x] == 1:
                n[x] = True
            if n[x] == 0:
                n[x] = False
        if n[x] != f[x]:
            if debug:
                print("%s != %s"  % (n[x],f[x]))
                print("n=%s" % json.dumps(n,sort_keys=True))
                print("f=%s" % json.dumps(f,sort_keys=True))
            ret = False
            break
    return ret

def getLastUpdate(t):
    db = Query()
    o = db.query("""
        select last_check from salesforce_last_update
            where sf_table_schema = %s
        """,(t,)
    )
    ret = None
    for x in o:
        ret = x['last_check']
    return ret
    
def setLastUpdate(t):
    db = Query()
    db.update("""
        replace into salesforce_last_update (sf_table_schema,last_check) 
            values (%s,now())
        """,(t,)
    )
    db.commit()
