#!/usr/bin/python

import os
import random
import sys
from datetime import datetime, timedelta
import time
import json
import requests

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
from common import settings
from util import encryption,calcdate
from util import getIDs

config = settings.config()
config.read("settings.cfg")

CONTACT_MAPPING = {
    'Email':'email',
    'Salutation':'title',
    'FirstName':'firstName',
    'Phone':'phone',
    'PainID__c':'textCustomField1',
    'Id':'textCustomField2',
    'LastName':'lastName'
}

DEAL_MAPPING = {
    'OwnerId':'ownerid',
    'Payment_Amount__c':'textCustomField4',
    "Ready_To_Buy__c": 'textCustomField5',
    "Subscription_Plan__c": 'textCustomField6',
    "Id": 'textCustomField4',
    'PainID__c':'textCustomField1',
    'PainURL__c':'textCustomField3',
    'Sales_Link__c':'textCustomField2'
}
COMPANY_MAPPING = {
    'PainID__c':'textCustomField1',
    'PainURL__c':'textCustomField2',
    'Addresses_ID__c':'textCustomField4',
    'Company':'name',
    'OwnerId':'owner',
    'Street': 'billingAddressLine1',
    'Website':'website',
    'PostalCode':'zip',
    'Phone':'phone',
    'City':'billingCity',
    'State':'billingState',
    'Id': 'textCustomField5'
}

class SM_Base:

    __call__ = None
    __BASE__ = 'https://poundpain1.salesmate.io'
    __DEBUG__ = False
    __TYPE__ = 'GET'
    def __init__(self):
        pass

    def getSession(self):
        return config.getKey("salesmate_session_key")

    def requestType(self):
        return self.__TYPE__

    def setType(self,c):
        self.__TYPE__ = c

    def setCall(self,c):
        if self.__DEBUG__:
            print("DEBUG: setcall: %s" % c)
        self.__call__ = c

    def getPayload(self,painid):
        return {}

    def setDebug(self,c):
        self.__DEBUG__ = c

    def post(self):
        pass
    
    def getCall(self):
        return self.__call__

    def setData(self,*args,**kwargs):
        pass

    def getData(self,payload={}):
        call = self.getCall()
        if call is None:
            raise Exception("Call required")
        if self.requestType() == 'GET':
            u = "%s%s" % (self.__BASE__,call) 
            if self.__DEBUG__:
                print("DEBUG: u=%s" % u)
            headers = {
              'Content-Type': 'application/json',
              'accessToken': self.getSession(),
              'x-linkname': 'poundpain1.salesmate.io'
            }
            r = requests.request('GET',u,headers=headers,data=payload)
            if self.__DEBUG__:
                print("status: %s" % r.status_code)
            if r.status_code != 200:
                raise Exception("%s: %s" % (r.status_code,r.text))
            js = json.loads(r.text)
            if self.__DEBUG__:
                print("response: %s" % js)
            return js['Data']
        if self.requestType() == 'POST':
            u = "%s%s" % (self.__BASE__,call) 
            if self.__DEBUG__:
                print("DEBUG: u=%s" % u)
            headers = {
              'Content-Type': 'application/json',
              'accessToken': self.getSession(),
              'x-linkname': 'poundpain1.salesmate.io'
            }
            if self.__DEBUG__:
                print("DEBUG: payload=%s" % payload)
            r = requests.request('POST',u,headers=headers,data=payload)
            if self.__DEBUG__:
                print("status: %s" % r.status_code)
            if r.status_code != 200:
                raise Exception("%s: %s" % (r.status_code,r.text))
            js = json.loads(r.text)
            if self.__DEBUG__:
                print("response: %s" % js)
            ### data
            ### fromDate
            ### toDate
            ### totalRows
            if 'Data' in js and 'totalRows' in js['Data']:
                # Paging goes here
                print("rows=%s" % js['Data']['totalRows'])
            ret = {}
            if 'Data' in js:
                ret = js['Data']
            if 'Data' in js and 'data' in js['Data']:
                ret = js['Data']['data']
            return ret
            

class SM_User(SM_Base):

    def __init__(self):
        super().__init__()

    def get(self,*args,**kwargs):
        self.setCall('/apis/core/v4/users?status=active')
        return self.getData(*args,**kwargs)

class SM_Contacts(SM_Base):

    def __init__(self):
        super().__init__()

    def getPayload(self):
        j = {
          "displayingFields": [
            "contact.textCustomField1",
            "contact.textCustomField2",
            "contact.textCustomField3",
            "contact.textCustomField4",
            "contact.textCustomField5",
            "contact.textCustomField6",
            "contact.company.name",
            "contact.company.id",
            "contact.company.photo",
            "contact.designation",
            "contact.type",
            "contact.email",
            "contact.mobile",
            "contact.phone",
            "contact.billingCity",
            "contact.billingCountry",
            "contact.tags",
            "contact.name",
            "contact.lastNoteAddedBy.name",
            "contact.lastNoteAddedBy.photo",
            "contact.lastNoteAddedBy.id",
            "contact.lastNoteAddedAt",
            "contact.lastNote",
            "contact.lastCommunicationMode",
            "contact.lastCommunicationBy",
            "contact.lastCommunicationAt",
            "contact.lastModifiedBy.name",
            "contact.lastModifiedBy.photo",
            "contact.lastModifiedBy.id",
            "contact.createdBy.name",
            "contact.createdBy.photo",
            "contact.createdBy.id",
            "contact.lastModifiedAt",
            "contact.openDealCount",
            "contact.utmSource",
            "contact.utmCampaign",
            "contact.utmTerm",
            "contact.utmMedium",
            "contact.utmContent",
            "contact.library",
            "contact.emailMessageCount",
            "contact.description",
            "contact.photo",
            "contact.emailOptOut",
            "contact.firstName",
            "contact.lastName",
            "contact.id"
          ],
          "filterQuery": {
            "group": {
              "operator": "AND",
              "rules": [
                {
                  "condition": "IS_AFTER",
                  "moduleName": "Contact",
                  "field": {
                    "fieldName": "contact.createdAt",
                    "displayName": "Created At",
                    "type": "DateTime"
                  },
                  "data": "Jan 01, 1970 05:30 AM",
                  "eventType": "DateTime"
                }
              ]
            }
          },
          "sort": {
            "fieldName": "contact.createdAt",
            "order": "desc"
          },
          "moduleId": 1,
          "getRecordsCount": True
        }
        return json.dumps(j)

    def get(self,*args,**kwargs):
        self.setCall('/apis/contact/v4/search?rows=250&from=0')
        self.setType('POST')
        toget = self.getPayload()
        return self.getData(payload=toget)

    def update(self,args,dryrun=False):
        self.setCall('/apis/contact/v4')
        self.setType('POST')
        upd = args
        toset = {}
        for x in upd:
            if x in CONTACT_MAPPING:
                v = CONTACT_MAPPING[x] 
                toset[v] = upd[x]
        
        print("CONTACTSET:%s" % json.dumps(toset,indent=4))
        if dryrun:
            return {'id':None}
        else:
            return self.getData(payload=json.dumps(toset))
    
class SM_Companies(SM_Base):
    def __init__(self):
        super().__init__()

    def getPayload(self):
        j = {
          "displayingFields": [
            "company.type",
            "company.painid",
            "company.painurl",
            "company.saleslink",
            "company.addressesid",
            "company.address",
            "company.phone",
            "company.billingAddressLine1",
            "company.textCustomField3",
            "company.tags",
            "company.annualRevenue",
            "company.billingCity",
            "company.owner.name",
            "company.owner.id",
            "company.name",
            "company.billingState",
            "company.billingCountry",
            "company.totalAmountOfOpenDeal",
            "company.lastCommunicationAt",
            "company.lastCommunicationMode",
            "company.openActivities",
            "company.totalAmountOfWonDeal",
            "company.textCustomField1",
            "company.textCustomField2",
            "company.textCustomField3",
            "company.textCustomField4",
            "company.textCustomField5",
            "company.textCustomField6",
            "company.wonDealCount",
            "company.lostDealCount",
            "company.openDealCount",
            "company.photo",
            "company.createdAt",
            "company.id"
          ],
          "filterQuery": {
            "group": {
              "operator": "AND",
              "rules": [
                {
                  "condition": "IS_AFTER",
                  "moduleName": "Company",
                  "field": {
                    "fieldName": "company.createdAt",
                    "displayName": "Created At",
                    "type": "DateTime"
                  },
                  "data": "Jan 01, 1970 05:30 AM",
                  "eventType": "DateTime"
                }
              ]
            }
          },
          "sort": {
            "fieldName": "company.createdAt",
            "order": "desc"
          },
          "moduleId": 5,
          "getRecordsCount": True
        }
        return json.dumps(j)

    def get(self,*args,**kwargs):
        self.setType('POST')
        self.setCall('/apis/company/v4/search?rows=250&from=0')
        toget = self.getPayload()
        return self.getData(payload=toget)

    def update(self,args,dryrun=False):
        self.setType('POST')
        self.setCall('/apis/company/v4')
        upd = args
        toset = {}
        for x in upd:
            if x in COMPANY_MAPPING:
                v = COMPANY_MAPPING[x] 
                toset[v] = upd[x]
        print("COMPANYSET:%s" % json.dumps(toset,indent=4))
        if dryrun:
            return {'id':None}
        else:
            return self.getData(payload=json.dumps(toset))

class SM_Deals(SM_Base):
    def __init__(self):
        super().__init__()

    def getPayload(self):
        j = {
          "displayingFields": [
            "deal.textCustomField1",
            "deal.textCustomField2",
            "deal.textCustomField3",
            "deal.textCustomField4",
            "deal.textCustomField5",
            "deal.textCustomField6",
            "deal.id",
            "deal.title",
            "deal.primaryContact.totalActivities",
            "deal.primaryContact.id",
            "deal.primaryContact.photo",
            "deal.primaryContact.closedActivities",
            "deal.primaryContact.openActivities",
            "deal.lastModifiedAt",
            "deal.pipeline",
            "deal.stage",
            "deal.owner.name",
            "deal.owner.photo",
            "deal.owner.id",
            "deal.lastCommunicationBy",
            "deal.source",
            "deal.dealValue",
            "deal.status",
            "deal.estimatedCloseDate",
            "deal.lastNote",
            "deal.lastActivityAt",
            "deal.primaryCompany.name",
            "deal.primaryCompany.id",
            "deal.primaryCompany.photo",
            "deal.lostReason",
            "deal.currency",
            "deal.priority",
            "deal.tags",
            "deal.description",
            "deal.closedDate",
            "deal.primaryContact.name",
            "deal.lastCommunicationAt",
            "deal.primaryContact.firstName",
                "deal.primaryContact.lastName"
              ],
              "filterQuery": {
                "group": {
                  "operator": "AND",
                  "rules": [
                    {
                      "condition": "IS_AFTER",
                      "moduleName": "Deal",
                      "field": {
                        "fieldName": "deal.createdAt",
                        "displayName": "Created At",
                        "type": "DateTime"
                      },
                      "data": "Jan 01, 1970 05:30 AM",
                      "eventType": "DateTime"
                    }
                  ]
                }
              },
              "sort": {
                "fieldName": "deal.createdAt",
                "order": "desc"
              },
              "moduleId": 4,
              "getRecordsCount": True
            }
        return json.dumps(j)

    def get(self,*args,**kwargs):
        self.setType('POST')
        self.setCall('/apis/deal/v4/search?rows=250&from=0')
        toget = self.getPayload()
        return self.getData(payload=toget)

    def update(self,args,dryrun=False):
        self.setCall('/apis/deal/v4')
        self.setType('POST')
        upd = args
        toset = {}
        for x in upd:
            if x in DEAL_MAPPING:
                v = DEAL_MAPPING[x] 
                toset[v] = upd[x]
        print("DEALSET:%s" % json.dumps(toset,indent=4))
        if dryrun:
            return {'id':None}
        else:
            return self.getData(payload=json.dumps(toset))

def getContacts():
    CONTACTS = {}
    contact = SM_Contacts()
    for x in contact.get():
        print("contact=%s" % json.dumps(x,sort_keys=True))
        v = x['id']
        CONTACTS[v] = x
    return CONTACTS

def getDeals():
    deals = SM_Deals()
    DEALS = {}
    for x in deals.get():
        print("deal=%s" % json.dumps(x,sort_keys=True))
        v = x['id']
        DEALS[v] = x
    return DEALS

def getUsers():
    USERS = {}
    users = SM_Users()
    for x in users.get():
        print("user=%s" % json.dumps(x,sort_keys=True))
        v = x['id']
        USERS[v] = x
    return USERS


def getCompanies():
    COMPANIES = {}
    company = SM_Companies()
    for x in company.get():
        print("company=%s" % json.dumps(x,sort_keys=True))
        v = x['id']
        COMPANIES[v] = x
    return COMPANIES

