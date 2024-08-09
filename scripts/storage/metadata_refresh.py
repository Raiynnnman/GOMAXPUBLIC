import os
import random
import sys
import requests

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
from util import getIDs
from storage.StorageUtil import StorageUtil

su = StorageUtil()
r = su.post("/storage/metadata/refresh",data={})
print(r)

