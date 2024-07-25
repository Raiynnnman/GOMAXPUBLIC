from util.DBOps import Query

def getBillingSystem():
    db = Query()
    ret = {}
    o = db.query("select billing_system_id from billing_system_current")
    ret = o[0]['billing_system_id']
    return ret

def getAltStatus():
    db = Query()
    ret = {}
    o = db.query("select id,name from office_alternate_status")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret

def getActionType():
    db = Query()
    ret = {}
    o = db.query("select id,name from provider_queue_actions_type")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret

def getActionStatus():
    db = Query()
    ret = {}
    o = db.query("select id,name from provider_queue_actions_status")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret

def getCallStatus():
    db = Query()
    ret = {}
    o = db.query("select id,name from provider_queue_call_status")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret

def getReferrerUserStatus():
    db = Query()
    ret = {}
    o = db.query("select id,name from referrer_users_status")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret

def getLeadStrength():
    db = Query()
    ret = {}
    o = db.query("select id,name from provider_queue_lead_strength")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
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

def getOfficeTypes():
    db = Query()
    ret = {}
    o = db.query("select id,name from office_type")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret 

def getOfficeNotificationCategories():
    db = Query()
    ret = {}
    o = db.query("select id, name from office_notifications_category")
    for x in o:
        n = x['name']
        i = x['id']
        ret[n] = i
    return ret

def getFirstNames():
    db = Query()
    o = db.query("select value from stub_first_names")
    return o

def getAreaCodes():
    db = Query()
    o = db.query("select label,value from stub_area_codes")
    ret = {}
    for x in o:
        if x['label'] not in ret:
            ret[x['label']] = []
        ret[x['label']].append(x['value'])
    return ret

def getLastNames():
    db = Query()
    o = db.query("select value from stub_last_names")
    return o
