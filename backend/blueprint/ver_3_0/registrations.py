# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import RegistrationRest

registrations = Blueprint('registrations', __name__)

@registrations.route('/registrations/update', methods=['POST'])
@swag_from(docs_dir + 'registrationupdate.yaml')
def regupdate(*args, **kwargs):
    po = RegistrationRest.RegistrationUpdateRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/registrations/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'registrationlist.yaml')
def reglist(*args, **kwargs):
    po = RegistrationRest.RegistrationListRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/landing/get', methods=['POST'])
@swag_from(docs_dir + 'landingdata.yaml')
def landingdata(*args, **kwargs):
    po = RegistrationRest.RegistrationLandingDataRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/registration/verify', methods=['POST'])
@swag_from(docs_dir + 'landingverify.yaml')
def landingverify(*args, **kwargs):
    po = RegistrationRest.RegistrationVerifyRest()
    return po.postWrapper(*args,**kwargs)
