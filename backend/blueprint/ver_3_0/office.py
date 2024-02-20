# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import OfficeRest

office_set = Blueprint('office_set', __name__)

@office_set.route('/office/physician/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'physicianlist.yaml')
def phylist(*args, **kwargs):
    po = OfficeRest.PhysicianListRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/physician/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'physicianupdate.yaml')
def phyupdate(*args, **kwargs):
    po = OfficeRest.PhysicianUpdateRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/bundle/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'bundlelist.yaml')
def bundlelist(*args, **kwargs):
    po = OfficeRest.BundleListRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/bundle/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'bundleupdate.yaml')
def bundleupdate(*args, **kwargs):
    po = OfficeRest.BundleUpdateRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/invoices/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_invoices_list.yaml')
def invoiceslist(*args, **kwargs):
    po = OfficeRest.InvoicesListRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/users/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_users_list.yaml')
def userslist(*args, **kwargs):
    po = OfficeRest.UsersListRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/users/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_users_update.yaml')
def usersupdate(*args, **kwargs):
    po = OfficeRest.UsersUpdateRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/transfers/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_transfers_list.yaml')
def translist(*args, **kwargs):
    po = OfficeRest.TransferListRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/associations/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_associations_list.yaml')
def offassoc(*args, **kwargs):
    po = OfficeRest.AssociationListRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/associations/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_associations_update.yaml')
def offassocupd(*args, **kwargs):
    po = OfficeRest.AssociationUpdateRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/codes/search', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_codes_search.yaml')
def searchcpt(*args, **kwargs):
    po = OfficeRest.BundleCPTCodeRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/procedures/search', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_procedures_search.yaml')
def searchcm(*args, **kwargs):
    po = OfficeRest.BundleCMCodeRest()
    return po.postWrapper(*args,**kwargs)
