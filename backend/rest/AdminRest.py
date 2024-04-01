# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Admin
from processing.Context import GetContext,DelContext

class OfficeListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.OfficeList()
        ret = u.process(args[0])
        return ret

class OfficeSaveRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.OfficeSave()
        ret = u.process(args[0])
        return ret

class GetContextRest(RestBase):

    def post(self, *args, **kwargs):
        u = GetContext()
        ret = u.process(args[0])
        return ret

class DelContextRest(RestBase):

    def post(self, *args, **kwargs):
        u = DelContext()
        ret = u.process(args[0])
        return ret

class AdminDashboard(RestBase):

    def get(self, *args, **kwargs):
        u = Admin.AdminDashboard()
        ret = u.process(args)
        return ret

class BundleListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.BundleList()
        ret = u.process(args[0])
        return ret


class BundleUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.BundleUpdate()
        ret = u.process(args[0])
        return ret

class LegalListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.LegalList()
        ret = u.process(args[0])
        return ret

class LegalUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.LegalUpdate()
        ret = u.process(args[0])
        return ret

class UserListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.UserList()
        ret = u.process(args[0])
        return ret

class UserUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.UserUpdate()
        ret = u.process(args[0])
        return ret

class InvoicesListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.InvoicesList()
        ret = u.process(args[0])
        return ret

class InvoicesUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.InvoicesUpdate()
        ret = u.process(args[0])
        return ret

class TransfersListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.TransfersList()
        ret = u.process(args[0])
        return ret

class CorporationListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.CorporationList()
        ret = u.process(args[0])
        return ret

class CorporationUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.CorporationUpdate()
        ret = u.process(args[0])
        return ret

class RegistrationUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.RegistrationUpdate()
        ret = u.process(args[0])
        return ret

class RegistrationListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.RegistrationList()
        ret = u.process(args[0])
        return ret

class TrafficGetRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.TrafficGet()
        ret = u.process(args[0])
        return ret

class PlansGetRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.PlansList()
        ret = u.process(args[0])
        return ret

class AdminReportGetRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.AdminReportGet()
        ret = u.process(args[0])
        return ret


class AdminBookingRegisterRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.AdminBookingRegister()
        ret = u.process(args[0])
        return ret

class ReferrerListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.ReferrerList()
        ret = u.process(args[0])
        return ret


