#!/usr/bin/python

import os
import sys
import jwt

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
import argparse


config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--password', dest="password", action="store")
args = parser.parse_args()

enc = encryption.encrypt(args.password, config.getKey("encryption_key"))
print(enc)
