# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.login import token_required
import json
import sys
import os
from blueprint.helper import docs_dir, restcall
from common import settings
from rest import StorageDataRest

storage = Blueprint('storage', __name__)

@storage.route('/storage/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def storageupdate(*args,**kwargs):
    po = StorageDataRest.StoreDataRest()
    return po.postWrapper(*args,**kwargs)


