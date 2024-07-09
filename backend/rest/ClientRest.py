# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Client


class ClientAppointmentListRest(RestBase):

    def post(self, *args, **kwargs):
        u = Client.AppointmentList()
        ret = u.process(args[0])
        return ret

class ClientAppointmentListCreate(RestBase):

    def post(self,*args,**kwargs):
        u = Client.AppointmentsCreate()
        ret = u.process(args[0])
        return ret