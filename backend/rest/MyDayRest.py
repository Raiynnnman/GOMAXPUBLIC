# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import MyDay

class GetDayInformationRest(RestBase):

    def post(self, *args, **kwargs):
        u = MyDay.GetDayInformation()
        ret = u.process(args[0])
        return ret

class UpdateScheduleRest(RestBase):

    def post(self, *args, **kwargs):
        u = MyDay.UpdateSchedule()
        ret = u.process(args[0])
        return ret

class ApproveInvoiceRest(RestBase):

    def post(self, *args, **kwargs):
        u = MyDay.ApproveInvoice()
        ret = u.process(args[0])
        return ret

class UpdateAppointmentRest(RestBase):

    def post(self, *args, **kwargs):
        u = MyDay.UpdateAppointment()
        ret = u.process(args[0])
        return ret

class OfficeBillingDownloadDocRest(RestBase):

    def post(self, *args, **kwargs):
        u = MyDay.MyDayBillingDownloadDoc()
        ret = u.process(args[0])
        return ret

class MyDayReceiptUploadRest(RestBase):

    def post(self, *args, **kwargs):
        u = MyDay.MyDayReceiptUpload()
        ret = u.process(args[0])
        return ret


class GetOfficePatientsRest(RestBase):

    def post(self, *args, **kwargs):
        u = MyDay.GetOfficePatients()
        ret = u.process(args[0])
        return ret


class SaveCustomAppointmentRest(RestBase):

    def post(self, *args, **kwargs):
        u = MyDay.SaveCustomAppointment()
        ret = u.process(args[0])
        return ret
