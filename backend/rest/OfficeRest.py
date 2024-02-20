# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Office,Bundles

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

class BundleListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Bundles.BundleList()
        ret = u.process(args[0])
        return ret

class BundleUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Bundles.BundleUpdate()
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

class TransferListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.TransfersList()
        ret = u.process(args[0])
        return ret

class AssociationListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.AssociationList()
        ret = u.process(args[0])
        return ret

class AssociationUpdateRest(RestBase):

    def post(self, *args, **kwargs):
        u = Office.AssociationUpdate()
        ret = u.process(args[0])
        return ret

class BundleCPTCodeRest(RestBase):

    def post(self, *args, **kwargs):
        u = Bundles.BundleCPTCodeSearch()
        ret = u.process(args[0])
        return ret

class BundleCMCodeRest(RestBase):

    def post(self, *args, **kwargs):
        u = Bundles.BundleCMCodeSearch()
        ret = u.process(args[0])
        return ret
