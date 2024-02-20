# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import MyDayRest

myday = Blueprint('myday', __name__)

@myday.route('/myday/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'myday_get.yaml')
def phylist(*args, **kwargs):
    po = MyDayRest.GetDayInformationRest()
    return po.postWrapper(*args,**kwargs)

@myday.route('/myday/schedule/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'myday_schedule_update.yaml')
def updsched(*args, **kwargs):
    po = MyDayRest.UpdateScheduleRest()
    return po.postWrapper(*args,**kwargs)

@myday.route('/myday/appointment/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'myday_appointment_update.yaml')
def updappt(*args, **kwargs):
    po = MyDayRest.UpdateAppointmentRest()
    return po.postWrapper(*args,**kwargs)

@myday.route('/myday/invoice/approve', methods=['POST'])
@token_required
@swag_from(docs_dir + 'myday_approve_invoice.yaml')
def appinv(*args, **kwargs):
    po = MyDayRest.ApproveInvoiceRest()
    return po.postWrapper(*args,**kwargs)

@myday.route('/myday/billing/document/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'myday_document_get.yaml')
def getbilldoc(*args, **kwargs):
    po = MyDayRest.OfficeBillingDownloadDocRest()
    return po.postWrapper(*args,**kwargs)

@myday.route('/myday/appointment/receipt/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'myday_document_get.yaml')
def receiptbilldoc(*args, **kwargs):
    po = MyDayRest.MyDayReceiptUploadRest()
    return po.postWrapper(*args,**kwargs)


@myday.route('/myday/office/patients', methods=['GET'])
@token_required
# @swag_from(docs_dir + 'myday_document_get.yaml')
def get_office_patients(*args, **kwargs):
    po = MyDayRest.GetOfficePatientsRest()
    return po.postWrapper(*args, **kwargs)


@myday.route('/myday/custom/appointment', methods=['POST'])
@token_required
def save_custom_appointment(*args, **kwargs):
    po = MyDayRest.SaveCustomAppointmentRest()
    return po.postWrapper(*args, **kwargs)
