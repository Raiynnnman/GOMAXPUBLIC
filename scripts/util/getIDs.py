from util.DBOps import Query

def getBillingSystem():
    db = Query()
    ret = {}
    o = db.query("select billing_system_id from billing_system_current")
    ret = o[0]['billing_system_id']
    return ret

def getTrafficCategories():
    db = Query()
    ret = {}
    o = db.query("select category_id,id from traffic_categories")
    for x in o:
        n = x['category_id']
        i = x['id']
        ret[n] = i
    return ret

def getProviderQueueStatus():
    db = Query()
    ret = {}
    o = db.query("select id,name from provider_queue_status")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret 

def getAppointStatus():
    db = Query()
    ret = {}
    o = db.query("select id,name from appt_status")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret 

def getPermissionIDs():
    db = Query()
    ret = {}
    o = db.query("select id,name from permissions")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret 

def getEntitlementIDs():
    db = Query()
    ret = {}
    o = db.query("select id,name from entitlements")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret 

def getInvoiceIDs():
    db = Query()
    ret = {}
    o = db.query("select id,name from invoice_status")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret 

def getCPTCodes():
    db = Query()
    ret = {}
    o = db.query("select id,code from icd_cpt")
    for x in o:
        n = x['code']
        i = x['id']
        ret[n] = i
    return ret 
