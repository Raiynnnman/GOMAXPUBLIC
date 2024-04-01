# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Office

class PhysicianListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.PhysicianList()
        ret = u.process(args[0])
        return ret

class PhysicianUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.PhysicianSave()
        ret = u.process(args[0])
        return ret

class InvoicesListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.OfficeInvoicesList()
        ret = u.process(args[0])
        return ret

class UsersListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.UsersList()
        ret = u.process(args[0])
        return ret

class UsersUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.UsersUpdate()
        ret = u.process(args[0])
        return ret

class ClientListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.ClientList()
        ret = u.process(args[0])
        return ret

class DashboardRest(RestBase):
    def get(self, *args, **kwargs):
        u = Office.OfficeDashboard()
        ret = u.process(args[0])
        return ret

class ClientUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.ClientUpdate()
        ret = u.process(args[0])
        return ret

class ReferrerDashboardRest(RestBase):
    def get(self, *args, **kwargs):
        u = Office.ReferrerDashboard()
        ret = u.process(args[0])
        return ret

class ReferrerUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.ReferrerUpdate()
        ret = u.process(args[0])
        return ret



