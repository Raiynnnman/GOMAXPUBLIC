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

@office_set.route('/office/client/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_users_update.yaml')
def clientslist(*args, **kwargs):
    po = OfficeRest.ClientListRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/dashboard', methods=['GET'])
@token_required
@swag_from(docs_dir + 'office_procedures_search.yaml')
def dashboard(*args, **kwargs):
    po = OfficeRest.DashboardRest()
    return po.getWrapper(*args,**kwargs)

@office_set.route('/office/client/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_users_update.yaml')
def clientupdate(*args, **kwargs):
    po = OfficeRest.ClientUpdateRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/referrer/dashboard', methods=['GET'])
@token_required
@swag_from(docs_dir + 'office_procedures_search.yaml')
def refdashboard(*args, **kwargs):
    po = OfficeRest.ReferrerDashboardRest()
    return po.getWrapper(*args,**kwargs)

@office_set.route('/office/referrer/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_users_update.yaml')
def refupdate(*args, **kwargs):
    po = OfficeRest.ReferrerUpdateRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/locations/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_users_list.yaml')
def locationlist(*args, **kwargs):
    po = OfficeRest.LocationsListRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/locations/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'office_users_update.yaml')
def locationupdate(*args, **kwargs):
    po = OfficeRest.LocationUpdateRest()
    return po.postWrapper(*args,**kwargs)

@office_set.route('/office/referral/update', methods=['POST'])
@swag_from(docs_dir + 'office_users_update.yaml')
def referralupdate(*args, **kwargs):
    po = OfficeRest.ReferralUpdateRest()
    return po.postWrapper(*args,**kwargs)
