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
    print("p=%s" % pdata)
    print("s=%s" % sdata)
    print("p-%s = sf-%s" % (psha,ssha))
    if psha != ssha:
        return False
    return True

def synchronizeData(prow,srow,sfschema,pschema,db):
    # print(json.dumps(prow,indent=4))
    upd = 0 # default to PAIN
    ret = {}
    upd = 1
    for y in pschema:
        if not pschema[y]['include_in_update']:
            continue
        SFFIELD = pschema[y]['sf_field_name']
        if y not in sfschema:
            raise Exception('"%s" missing from SF schema' % y)
        SFCOLNAME = sfschema[y]['name']
        print(pschema[y])
        field = pschema[y]['pain_field_name']
        table = pschema[y]['pain_table_name']
        filt = pschema[y]['pain_special_filter']
        join = pschema[y]['pain_join_col']
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
        ftable = table
        jtable = table
        if ',' in ftable:
            j = table
            ftable = j.split(',')[0]
            jtable = j.split(',')[1]

        q = """
            select %s.%s as s,%s.updated as u,%s.id as i from %s where %s.%s = %s %s
        """ % (ftable,field,ftable,ftable,table,jtable,join,val,filt)
        print("q=%s" % q)
        o = db.query(q)
        print("o=%s" %o)
        v = None
        if len(o) > 0:
            v = o[0]['s']
        ret[SFCOLNAME] = v
        print("-----")

    return (upd,ret)


def compareDicts(n,f):
    if n is None:
        return False
    if f is None:
        return False
    sfmod = f['LastModifiedDate']
    del f['LastModifiedDate']
    ret = False
    print("n=%s" % json.dumps(n,sort_keys=True))
    print("f=%s" % json.dumps(f,sort_keys=True))
    for x in n:
        if x not in f:
            print("%s wasnt in f" % x)
            return False
        if isinstance(f[x],bool):
            if n[x] == 1:
                n[x] = True
            if n[x] == 0:
                n[x] = False
        if n[x] != f[x]:
            print("%s != %s"  % (n[x],f[x]))
            return False
    print("ret true")
    return True


