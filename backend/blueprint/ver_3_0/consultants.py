# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import ConsultantsRest

consultants = Blueprint('consultants', __name__)
@consultants.route('/consultants/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'consultants_get.yaml')
def getconfig(*args, **kwargs):
    po = ConsultantsRest.ConsultantConfigRest()
    return po.postWrapper(*args,**kwargs)

@consultants.route('/consultants/dashboard', methods=['GET'])
@token_required
@swag_from(docs_dir + 'consultants_dashboard.yaml')
def getdash(*args, **kwargs):
    po = ConsultantsRest.ConsultantDashboardRest()
    return po.getWrapper(*args,**kwargs)

@consultants.route('/consultants/billing/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'consultants_billing_get.yaml')
def getbill(*args, **kwargs):
    po = ConsultantsRest.ConsultantBillingRest()
    return po.postWrapper(*args,**kwargs)

@consultants.route('/consultants/billing/document/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'consultants_billing_document_get.yaml')
def getbilldoc(*args, **kwargs):
    po = ConsultantsRest.ConsultantBillingDownloadDocRest()
    return po.postWrapper(*args,**kwargs)

@consultants.route('/consultants/schedule/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'consultants_schedule_update.yaml')
def updatesched(*args, **kwargs):
    po = ConsultantsRest.ConsultantScheduleUpdateRest()
    return po.postWrapper(*args,**kwargs)
