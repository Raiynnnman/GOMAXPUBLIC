# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
from blueprint.helper import docs_dir, restcall
from blueprint.login import token_required
from rest import SearchRest

search = Blueprint('search', __name__)

@search.route('/search/config', methods=['POST'])
@swag_from(docs_dir + 'searchconfig.yaml')
def config(*args, **kwargs):
    po = SearchRest.SearchConfig()
    return po.postWrapper(*args,**kwargs)

@search.route('/search/get', methods=['POST'])
@swag_from(docs_dir + 'searchget.yaml')
def searchget(*args, **kwargs):
    po = SearchRest.SearchGet()
    return po.postWrapper(*args,**kwargs)

@search.route('/search/reservation', methods=['POST'])
@swag_from(docs_dir + 'search_reservation.yaml')
def searchres(*args, **kwargs):
    po = SearchRest.SearchReservation()
    return po.postWrapper(*args,**kwargs)

@search.route('/search/register', methods=['POST'])
@swag_from(docs_dir + 'search_register.yaml')
def register(*args, **kwargs):
    po = SearchRest.SearchRegister()
    return po.postWrapper(*args,**kwargs)

@search.route('/search/schedule', methods=['POST'])
@swag_from(docs_dir + 'search_schedule.yaml')
def searchschedule(*args, **kwargs):
    po = SearchRest.SearchSchedule()
    return po.postWrapper(*args,**kwargs)
