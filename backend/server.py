# coding=utf-8

import os
import sys
from flasgger import Swagger
from flask import Flask,Response,request
from flask_cors import CORS, cross_origin

from common import settings, version
from blueprint.ver_3_0.ittools import ittools
from blueprint.ver_3_0.corporation import corporation
from blueprint.ver_3_0.users import users
from blueprint.ver_3_0.consultants import consultants
from blueprint.ver_3_0.myday import myday
from blueprint.ver_3_0.admin import admin
from blueprint.ver_3_0.search import search
from blueprint.ver_3_0.office import office_set
from blueprint.ver_3_0.leads import leads
from blueprint.ver_3_0.chat import chat
from blueprint.ver_3_0.registrations import registrations

app = Flask(__name__)

APIVER_MAJOR = 3
APIVER_MINOR = 0

app.template_folder = "./templates/"
app.static_folder = "./templates/"
app.static_path = "./templates/"
app.static_url_path = "./templates/"
app.instance_path = "./templates/"

config = settings.config()
config.read("settings.cfg")
os.umask(0o077)


debug = False
debugMode = config.getKey("debug")
if debugMode is not None:
    app.config['DEBUG'] = True
    debug = True
else:
    app.config['DEBUG'] = False

max_upload = config.getKey("max_upload_size")
if max_upload is None:
    max_upload = "10 * 1024 * 1024"
app.config['MAX_CONTENT_LENGTH'] = max_upload

app.config['SWAGGER'] = {
    "swagger_version": "2.0",
    "uiversion": "2",
    "specs": [
        {
            "version": "%s.%s.%s.%s-%s" % (
                version.MAJOR, version.MINOR, version.BUILD,
                version.RELEASE, version.COMMIT[0:7]),
            "title": "DHD API: %s.%s.%s.%s-%s" % (
                version.MAJOR, version.MINOR, version.RELEASE, version.BUILD,
                version.COMMIT[0:7]),
            "description": "DHD internal API, v%s.%s.%s.%s-%s" % (
                version.MAJOR, version.MINOR, version.RELEASE, version.BUILD,
                version.COMMIT[0:7]),
            "endpoint": 'v3_0',
            "route": '/3.0/spec'
        }
    ]
}

app.register_blueprint(ittools)
app.register_blueprint(corporation)
app.register_blueprint(users)
app.register_blueprint(consultants)
app.register_blueprint(admin)
app.register_blueprint(myday)
app.register_blueprint(office_set)
app.register_blueprint(search)
app.register_blueprint(leads)
app.register_blueprint(registrations)
app.register_blueprint(chat)

Swagger(app)
cors = CORS(app,
    origins=["http://*:8001"],
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True,
    send_wildcard=False
)
app.config['CORS_HEADERS'] = 'Content-Type'

def get_file(filename):  # pragma: no cover
    try:
        src = os.path.join(root_dir(), filename)
        return open(src).read()
    except IOError as exc:
        return str(exc)

def root_dir():  # pragma: no cover
    return os.path.abspath(os.path.dirname(__file__))

#@app.route('/', defaults={'path': ''})
#@app.route('/<path:path>')
def get_resource(path):  # pragma: no cover
    mimetypes = {
        ".css": "text/css",
        ".html": "text/html",
        ".js": "application/javascript",
    }
    complete_path = os.path.join(root_dir(), path)
    ext = os.path.splitext(path)[1]
    mimetype = mimetypes.get(ext, "text/html")
    content = get_file(complete_path)
    return Response(content, mimetype=mimetype)

if __name__ == '__main__':
    debug = False

    if config.getKey("debug") is not None:
        debug = True
        
    host = config.getKey("bind_port")
    port = int(config.getKey("http_port"))
    app.run(debug=debug, port=port, host=host)

def create_app():
    return app
