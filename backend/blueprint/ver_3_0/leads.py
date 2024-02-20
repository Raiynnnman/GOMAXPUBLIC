# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import LeadsRest

leads = Blueprint('leads', __name__)
@leads.route('/leads/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'leads_list.yaml')
def leads_list(*args, **kwargs):
    po = LeadsRest.LeadsListRest()
    return po.postWrapper(*args,**kwargs)

@leads.route('/leads/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'leads_update.yaml')
def leads_update(*args, **kwargs):
    po = LeadsRest.LeadsUpdateRest()
    return po.postWrapper(*args,**kwargs)

@leads.route('/leads/status/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'leads_status_update.yaml')
def leads_status_update(*args, **kwargs):
    po = LeadsRest.LeadsStatusUpdateRest()
    return po.postWrapper(*args,**kwargs)
