# coding=utf-8
# pylint: disable=fixme,broad-except

import unittest
import json
import sys
import traceback
import threading
from functools import wraps
from flask import make_response, request
from common import settings

config = settings.config()
config.read("settings.cfg")

docs_dir = "../../docs/ver_3_0/"
rest_manager = "rest_manager"

def restcall(rest_class):
    def rest_decor(func):
        @wraps(func)
        def rest_wrapper(*args, **kwargs):
            kwargs[rest_manager] = rest_class()
            kwargs[rest_manager].setConfig(config)
            return func(*args, **kwargs)
        return rest_wrapper
    return rest_decor
