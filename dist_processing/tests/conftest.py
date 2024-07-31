import pytest
import os
import sys

sys.path.insert(1, os.getcwd())  # make current directory act like a module

from server import create_app
from common import settings
from util.DBManager import DBManager 



@pytest.fixture(scope='session')
def app():
    config = settings.config()
    config.read("settings.cfg")
    config.update({
        "TESTING": True,
        "mysql_db": "testdb",   #TODO create, use testdb
    })
    app = create_app()
    DBManager().makeDB()      
    DBManager().initializeDB()

    # other setup can go here

    yield app

    # clean up / reset resources here


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()
