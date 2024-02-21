# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import LegalRest

legal = Blueprint('legal', __name__)
@legal.route('/legal/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'legal_get.yaml')
def getconfig(*args, **kwargs):
    po = LegalRest.LegalConfigRest()
    return po.postWrapper(*args,**kwargs)

@legal.route('/legal/dashboard', methods=['GET'])
@token_required
@swag_from(docs_dir + 'legal_dashboard.yaml')
def getdash(*args, **kwargs):
    po = LegalRest.LegalDashboardRest()
    return po.getWrapper(*args,**kwargs)

@legal.route('/legal/billing/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'legal_billing_get.yaml')
def getbill(*args, **kwargs):
    po = LegalRest.LegalBillingRest()
    return po.postWrapper(*args,**kwargs)

@legal.route('/legal/billing/document/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'legal_billing_document_get.yaml')
def getbilldoc(*args, **kwargs):
    po = LegalRest.LegalBillingDownloadDocRest()
    return po.postWrapper(*args,**kwargs)

@legal.route('/legal/schedule/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'legal_schedule_update.yaml')
def updatesched(*args, **kwargs):
    po = LegalRest.LegalScheduleUpdateRest()
    return po.postWrapper(*args,**kwargs)
