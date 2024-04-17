import requests
import json

url = "https://link_name.salesmate.io/apis/contact/v4/search?rows=250&from=0"

payload = json.dumps({
  "displayingFields": [
    "contact.company.name",
    "contact.company.id",
    "contact.company.photo",
    "contact.designation",
    "contact.type",
    "contact.email",
    "contact.mobile",
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
    "fieldName": "",
    "order": ""
  },
  "moduleId": 1,
  "reportType": "get_data",
  "getRecordsCount": True
})
headers = {
  'Content-Type': 'application/json',
  'accessToken': 'f6d19570-fbef-11ee-b605-71c24516b6db',
  'x-linkname': 'poundpain1.salesmate.io'
}
print("k=%s" % json.dumps(json.loads(payload),sort_keys=True))

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)

