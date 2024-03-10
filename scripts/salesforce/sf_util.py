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



