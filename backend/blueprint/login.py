
import sys
import os
import json
import unittest
import jwt
import traceback
from functools import wraps
from flask import make_response, request, jsonify

sys.path.append(os.path.realpath(os.curdir))

from common import settings
from common.InvalidCredentials import InvalidCredentials
from processing.Profile import Profile
from util.Logging import Logging

log = Logging()
config = settings.config()
config.read("settings.cfg")

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        # ensure the jwt-token is passed with the headers
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if 'authorization' in request.headers:
            token = request.headers['authorization']
        if not token: # throw error if no token provided
            return make_response(jsonify({"message": "LOGIN_REQUIRED"}), 401)
        try:
            # decode the token to obtain user public_id
            token = token.replace("Bearer ","")
            data = jwt.decode(token, config.getKey("encryption_key"), algorithms=['HS256'])
            p = Profile()
            current_user = p.execute(0,{'user_id':data['user_id']})
            if not current_user['active']:
                raise InvalidCredentials('USER_INACTIVE')
            current_user['user_id'] = data['user_id']
            if len(current_user) < 1:
                raise Exception("USER_DOESNT_EXIST")
        except Exception as e:
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_tb(exc_traceback, limit=100, file=sys.stdout)
            log.info(str(e))
            return make_response(jsonify({"message": "LOGIN_REQUIRED"}), 401)
        # Return the user information attached to the token
        return f(current_user, *args, **kwargs)
    return decorator
