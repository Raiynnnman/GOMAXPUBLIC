# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Office, OfficeLocations, OfficeReferrals
from processing import OfficeClients

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
        u = OfficeClients.ClientList()
        ret = u.process(args[0])
        return ret

class DashboardRest(RestBase):
    def get(self, *args, **kwargs):
        u = Office.OfficeDashboard()
        ret = u.process(args[0])
        return ret

class ClientUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = OfficeClients.ClientUpdate()
        ret = u.process(args[0])
        return ret

class ReferrerDashboardRest(RestBase):
    def get(self, *args, **kwargs):
        u = OfficeReferrals.ReferrerDashboard()
        ret = u.process(args[0])
        return ret

class ReferrerUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = OfficeReferrals.ReferrerUpdate()
        ret = u.process(args[0])
        return ret

class LocationsListRest(RestBase):

    def post(self, *args, **kwargs):
        u = OfficeLocations.LocationList()
        ret = u.process(args[0])
        return ret

class LocationUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = OfficeLocations.LocationUpdate()
        ret = u.process(args[0])
        return ret

class ReferralUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = OfficeReferrals.ReferralUpdate()
        ret = u.process(args[0])
        return ret

class ProfileUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.ProfileUpdate()
        ret = u.process(args[0])
        return ret

class ProfileListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.ProfileList()
        ret = u.process(args[0])
        return ret
