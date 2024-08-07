# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import RegistrationRest

registrations = Blueprint('registrations', __name__)

@registrations.route('/register/user', methods=['POST'])
@swag_from(docs_dir + 'registrationupdate.yaml')
def regupdate(*args, **kwargs):
    po = RegistrationRest.RegistrationUpdateRest()
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

@registrations.route('/register/provider', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def registerprovider(*args, **kwargs):
    po = RegistrationRest.RegisterProviderRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/registration/card/intent', methods=['GET'])
@swag_from(docs_dir + 'user_card_intent.yaml')
def setupintent(*args, **kwargs):
    po = RegistrationRest.RegistrationSetupIntentRest()
    return po.getWrapper(*args,**kwargs)

@registrations.route('/search/provider', methods=['POST'])
@swag_from(docs_dir + 'user_card_intent.yaml')
def searchprov(*args, **kwargs):
    po = RegistrationRest.RegistrationSearchProviderRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/register/referrer', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def registerreferrer(*args, **kwargs):
    po = RegistrationRest.RegisterReferrerRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/contactus', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def contactus(*args, **kwargs):
    po = RegistrationRest.ContactUsRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/subscribe', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def subscribe(*args, **kwargs):
    po = RegistrationRest.SubscribeRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/location', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def location(*args, **kwargs):
    po = RegistrationRest.LocationRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/online-demo', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def onlinedemojoin(*args, **kwargs):
    po = RegistrationRest.OnlineDemoJoinRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/demo-traffic', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def trafficdemo(*args, **kwargs):
    po = RegistrationRest.OnlineDemoTrafficRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/calendar/booking', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def calbooking(*args, **kwargs):
    po = RegistrationRest.CalendarBookingRest()
    return po.postWrapper(*args,**kwargs)

@registrations.route('/register/patient', methods=['POST'])
@swag_from(docs_dir + 'registerprovider.yaml')
def registerpatient(*args, **kwargs):
    po = RegistrationRest.RegisterPatientRest()
    return po.postWrapper(*args,**kwargs)
