# coding=utf-8

import json
from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import UserLoginRest,ProfileRest,UserRest
import pdb
users = Blueprint('users', __name__)
@users.route('/login', methods=['POST'])
@swag_from(docs_dir + 'passwordlogin.yaml')
def password_check(*args, **kwargs):
    po = UserLoginRest.UserLoginRest()
    return po.postWrapper(*args,**kwargs)
    #return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

@users.route('/profile', methods=['GET'])
@token_required
@swag_from(docs_dir + 'profile.yaml')
def profile(*args, **kwargs):
    po = ProfileRest.ProfileRest()
    return po.getWrapper(*args,**kwargs)

@users.route('/reset', methods=['POST'])
@swag_from(docs_dir + 'reset_password.yaml')
def reset(*args, **kwargs):
    po = UserLoginRest.ResetPasswordWithTokenRest()
    return po.postWrapper(*args,**kwargs)

@users.route('/request', methods=['POST'])
@swag_from(docs_dir + 'request_token.yaml')
def requesttoken(*args, **kwargs):
    po = UserLoginRest.RequestTokenRest()
    return po.postWrapper(*args,**kwargs)

@users.route('/user/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'profile.yaml')
def getuser(*args, **kwargs):
    po = UserRest.UserConfigRest()
    return po.postWrapper(*args,**kwargs)


@users.route('/user/documents/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'user_documents_update.yaml')
def getdocuments(*args, **kwargs):
    po = UserRest.UserDocumentsUpdateRest()
    return po.postWrapper(*args,**kwargs)

@users.route('/user/card/intent', methods=['GET'])
@token_required
@swag_from(docs_dir + 'user_card_intent.yaml')
def setupintent(*args, **kwargs):
    po = UserRest.UserSetupIntentRest()
    return po.getWrapper(*args,**kwargs)

@users.route('/user/card/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'user_card_update.yaml')
def updatecard(*args, **kwargs):
    po = UserRest.UserCardUpdateRest()
    return po.postWrapper(*args,**kwargs)

@users.route('/user/card/set', methods=['POST'])
@token_required
@swag_from(docs_dir + 'user_card_set.yaml')
def updatecarddef(*args, **kwargs):
    po = UserRest.UserCardUpdateDefaultRest()
    return po.postWrapper(*args,**kwargs)

@users.route('/user/dashboard/get', methods=['POST'])
@token_required
@swag_from(docs_dir + 'user_dashboard.yaml')
def userdash(*args, **kwargs):
    po = UserRest.UserDashboardRest()
    return po.postWrapper(*args,**kwargs)

@users.route('/user/ratings/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'user_ratings.yaml')
def userratings(*args, **kwargs):
    po = UserRest.UserRatingsRest()
    return po.postWrapper(*args,**kwargs)
