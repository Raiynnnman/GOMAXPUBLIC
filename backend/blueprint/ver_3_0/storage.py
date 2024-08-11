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

@storage.route('/storage/metadata/refresh', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def metadata_refresh(*args,**kwargs):
    po = StorageDataRest.MetaDataRefreshRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/query/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def querylsit(*args,**kwargs):
    po = StorageDataRest.QueryListRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/query/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def queryupdate(*args,**kwargs):
    po = StorageDataRest.QueryUpdateRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/dataset/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def datasetupdate(*args,**kwargs):
    po = StorageDataRest.DatasetUpdateRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/dataset/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def datasetlist(*args,**kwargs):
    po = StorageDataRest.DatasetListRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/dataset/run', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def datasetrun(*args,**kwargs):
    po = StorageDataRest.DatasetRunRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/results/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def resultsget(*args,**kwargs):
    po = StorageDataRest.ResultsGetRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/results/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def resultslist(*args,**kwargs):
    po = StorageDataRest.ResultsListRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/filter/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def filterupdate(*args,**kwargs):
    po = StorageDataRest.FilterUpdateRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/filter/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def filterlist(*args,**kwargs):
    po = StorageDataRest.FilterListRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/jobs/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def jobslist(*args,**kwargs):
    po = StorageDataRest.JobsListRest()
    return po.postWrapper(*args,**kwargs)

@storage.route('/storage/metadata/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'test-service.yaml')
def mdget(*args,**kwargs):
    po = StorageDataRest.MetadataGetRest()
    return po.postWrapper(*args,**kwargs)
