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
