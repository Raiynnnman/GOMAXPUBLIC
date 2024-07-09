# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import ClientRest

client = Blueprint('client', __name__)

@client.route('/client/appointments',methods=["POST"])
@token_required
@swag_from(docs_dir + 'admin_office_list.yaml')
def apptlist(*args, **kwargs):
    po = ClientRest.ClientAppointmentListRest()
    return po.postWrapper(*args,**kwargs)

@client.route('/client/appointments_create',methods=["POST"])
@token_required
@swag_from(docs_dir + 'apointments_create.yaml')
def apptcreate(*args,**kwargs):
    po = ClientRest.ClientAppointmentListCreate()
    return po.postWrapper(*args,**kwargs)


# @token_required
# @swag_from(docs_dir + 'office_users_update.yaml')
# def usersupdate(*args, **kwargs):
#     po = OfficeRest.UsersUpdateRest()
#     return po.postWrapper(*args,**kwargs)

# @office_set.route('/office/client/list', methods=['POST'])
# @token_required
# @swag_from(docs_dir + 'office_users_update.yaml')
# def clientslist(*args, **kwargs):
#     po = OfficeRest.ClientListRest()
#     return po.postWrapper(*args,**kwargs)

# @office_set.route('/office/dashboard', methods=['GET'])
# @token_required
# @swag_from(docs_dir + 'office_procedures_search.yaml')
# def dashboard(*args, **kwargs):
#     po = OfficeRest.DashboardRest()
#     return po.getWrapper(*args,**kwargs)