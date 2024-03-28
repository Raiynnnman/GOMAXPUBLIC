#!/usr/bin/python

import os
import re
import shlex
import random
import sys
from datetime import datetime, timedelta
import time
import simplejson as json

sys.path.append(os.getcwd())  # noqa: E402

from util.DBOps import Query
import pandas as pd
from common import settings
from util import encryption,calcdate
from util import getIDs

import argparse

config = settings.config()
config.read("settings.cfg")
parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()


class Parser:
    IP = 0
    TIME = 3
    TIME_ZONE = 4
    REQUESTED_URL = 5
    STATUS_CODE = 6
    BYTES = 7
    USER_AGENT = 9

    def parse_line(self, line):
        try:
            line = re.sub(r"[\[\]]", "", line)
            data = shlex.split(line)
            result = {
                "ip": data[self.IP],
                "time": data[self.TIME],
                "bytes": data[self.BYTES],
                "status_code": data[self.STATUS_CODE],
                "requested_url": data[self.REQUESTED_URL],
                "user_agent": data[self.USER_AGENT],
            }
            return result
        except Exception as e:
            raise e


parser = Parser()
LOG_FILE = args.file
with open(LOG_FILE, "r") as f:
    log_entries = [parser.parse_line(line) for line in f]

print(json.dumps(log_entries[0],indent=4))
