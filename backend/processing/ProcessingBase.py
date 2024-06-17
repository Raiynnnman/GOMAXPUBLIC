# coding=utf-8
from util.DBOps import Query
from util import Jenkins
from common import settings
from flask import request


config = settings.config()
config.read("settings.cfg")

class ProcessingBase:

    __id__ = None
    __ui_ver__ = 1
    __do_jenkins__ = True

    def __init__(self):
        pass

    def doJenkins(self):
        return True

    def noJenkins(self):
        self.__do_jenkins__ = False

    def setUIVer(self): 
        if 'Ui' in request.headers:
            self.__ui_ver__ = request.headers['Ui']

    def getUIVer(self,c): 
        return self.__ui_ver__ 

    def isUIV2(self):
        if self.__ui_ver__ == 2:
            return True
        return False

    def getBillingSystem(self):
        db = Query()
        ret = {}
        o = db.query("select billing_system_id from billing_system_current")
        ret = o[0]['billing_system_id']
        return ret

    def getLanguages(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from languages")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getReferrerUserStatus(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from referrer_users_status")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def getClientIntake(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from client_intake_status")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
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
        o = db.query("""select id,price,
            upfront_cost,duration,description from pricing_data""")
        for x in o:
            i = x['id']
            ret[i] = x
        return ret 

    def getTrafficCategories(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from traffic_categories")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
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

    def setJenkinsID(self,i):
        self.__id__ = i

    def getInvoiceIDs(self):
        db = Query()
        ret = {}
        o = db.query("select id,name from invoice_status")
        for x in o:
            n = x['name']
            i = x['id']
            ret[n] = i
        return ret 

    def __del__(self):
        if config.getKey("use_defer")is not None:
            if self.doJenkins():
                Jenkins.spawnJob.delay(self.__class__.__name__,self.__id__)
