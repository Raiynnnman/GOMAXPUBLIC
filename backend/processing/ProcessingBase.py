# coding=utf-8
from util.DBOps import Query

class ProcessingBase:

    def __init__(self):
        pass

    def getBillingSystem(self):
        db = Query()
        ret = {}
        o = db.query("select billing_system_id from billing_system_current")
        ret = o[0]['billing_system_id']
        return ret
        
    def getLeadStrength(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from provider_queue_lead_strength")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getProviderQueueStatus(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from provider_queue_status")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getPlans(self):
        db = Query()
        ret = {}
        o = db.query("select id,price,duration,description from pricing_data")
        for x in o:
            i = x['id']
            ret[i] = x
        return ret 

    def getRegistrationTypes(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from registration_types")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getOfficeTypes(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from office_type")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getAppointStatus(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from appt_status")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getPermissionIDs(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from permissions")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getEntitlementIDs(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from entitlements")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getInvoiceIDs(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from invoice_status")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 
