# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing import Chat

class GetOfficeChat(RestBase):

    def post(self, *args, **kwargs):
        u = Chat.GetOfficeChat()
        ret = u.process(args[0])
        return ret

class GetCustChat(RestBase):

    def post(self, *args, **kwargs):
        u = Chat.GetCustChat()
        ret = u.process(args[0])
        return ret

class CreateRoomRest(RestBase):

    def post(self, *args, **kwargs):
        u = Chat.CreateRoom()
        ret = u.process(args[0])
        return ret

class UploadDocumentRest(RestBase):

    def post(self, *args, **kwargs):
        u = Chat.UploadDocumentFromRoom()
        ret = u.process(args[0])
        return ret

class DownloadDocumentRest(RestBase):

    def post(self, *args, **kwargs):
        u = Chat.DownloadDocumentFromRoom()
        ret = u.process(args[0])
        return ret
