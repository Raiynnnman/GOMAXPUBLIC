# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
import json
import sys
import os
from blueprint.login import token_required
from blueprint.helper import docs_dir, restcall
from common import settings
from rest import ChatRest

chat = Blueprint('chat', __name__)


@chat.route('/myday/chat/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'myday_chat_get.yaml')
def chat_off_get(*args, **kwargs):
    po = ChatRest.GetOfficeChat()
    return po.postWrapper(*args,**kwargs)

@chat.route('/myhealth/chat/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'myhealth_chat_get.yaml')
def chat_cust_get(*args, **kwargs):
    po = ChatRest.GetCustChat()
    return po.postWrapper(*args,**kwargs)


@chat.route('/chat/create', methods=['POST'])
@token_required
@swag_from(docs_dir + 'chat_create.yaml')
def createroom(*args, **kwargs):
    po = ChatRest.CreateRoomRest()
    return po.postWrapper(*args,**kwargs)

@chat.route('/chat/document/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'chat_document_update.yaml')
def uploaddoc(*args, **kwargs):
    po = ChatRest.UploadDocumentRest()
    return po.postWrapper(*args,**kwargs)

@chat.route('/chat/document/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'chat_document_get.yaml')
def downloaddoc(*args, **kwargs):
    po = ChatRest.DownloadDocumentRest()
    return po.postWrapper(*args,**kwargs)
