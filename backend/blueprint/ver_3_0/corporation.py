# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import CorporationRest

corporation = Blueprint('corporation', __name__)

@corporation.route('/corporation/users/list', methods=['POST'])
@token_required
@swag_from(docs_dir + 'corporation_user_list.yaml')
def corpuserlist(*args, **kwargs):
    po = CorporationRest.UsersListRest()
    return po.postWrapper(*args,**kwargs)

@corporation.route('/corporation/users/update', methods=['POST'])
@token_required
@swag_from(docs_dir + 'corporation_user_update.yaml')
def corpuserlistupd(*args, **kwargs):
    po = CorporationRest.UsersUpdateRest()
    return po.postWrapper(*args,**kwargs)
