# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Admin,Coupons,AdminCustomers
from processing import AdminTickets
from processing import AdminInvoices,AdminRegistrations
from processing import AdminTraffic, AdminCommissions,AdminOffice 
from processing.Context import GetContext,DelContext

class OfficeListRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminOffice.OfficeList()
        ret = u.process(args[0])
        return ret

class OfficeSaveRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminOffice.OfficeSave()
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

class BDRDashboardRest(RestBase):

    def get(self, *args, **kwargs):
        u = Admin.BDRDashboard()
        ret = u.process(args)
        return ret

class AdminDashboard(RestBase):

    def get(self, *args, **kwargs):
        u = Admin.AdminDashboard()
        ret = u.process(args)
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
        u = AdminInvoices.InvoicesList()
        ret = u.process(args[0])
        return ret

class InvoicesUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminInvoices.InvoicesUpdate()
        ret = u.process(args[0])
        return ret

class RegistrationUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminRegistrations.RegistrationUpdate()
        ret = u.process(args[0])
        return ret

class RegistrationListRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminRegistrations.RegistrationList()
        ret = u.process(args[0])
        return ret
    
class TicketUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminTickets.TicketUpdate()
        ret = u.process(args[0])
        return ret

class TicketListRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminTickets.TicketList()
        ret = u.process(args[0])
        print(ret)
        return ret


class TrafficGetRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminTraffic.TrafficGet()
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
        u = AdminRegistrations.AdminBookingRegister()
        ret = u.process(args[0])
        return ret

class ReferrerListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.ReferrerList()
        ret = u.process(args[0])
        return ret

class CouponUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Coupons.CouponSave()
        ret = u.process(args[0])
        return ret

class CouponListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Coupons.CouponList()
        ret = u.process(args[0])
        return ret

class CommissionListRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminCommissions.CommissionList()
        ret = u.process(args[0])
        return ret

class CommissionUserListRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminCommissions.CommissionUserList()
        ret = u.process(args[0])
        return ret

class CustomersUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminCustomers.CustomerUpdate()
        ret = u.process(args[0])
        return ret

class CustomersListRest(RestBase):

    def post(self, *args, **kwargs):
        u = AdminCustomers.CustomerList()
        ret = u.process(args[0])
        return ret

class OnlineDemoSaveRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.OnlineDemoSave()
        ret = u.process(args[0])
        return ret

class OnlineDemoListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Admin.OnlineDemoList()
        ret = u.process(args[0])
        return ret
