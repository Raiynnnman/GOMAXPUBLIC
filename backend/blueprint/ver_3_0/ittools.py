# coding=utf-8

from flasgger.utils import swag_from
from flask import Blueprint, request
import json
import sys
import os
from blueprint.helper import docs_dir, restcall
from common import settings

ittools = Blueprint('ittools', __name__)


@ittools.route('/service/online', methods=['GET'])
@swag_from(docs_dir + 'test-service.yaml')
def get_testservice():
	html = {"serviceonline": "true"}
	return json.dumps(html)


