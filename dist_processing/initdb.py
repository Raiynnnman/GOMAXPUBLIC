
from common import settings
config = settings.config()
config.read("settings.cfg")

#Initialize or migrate the database
from util.DBManager import DBManager
DBManager().initializeDB()
