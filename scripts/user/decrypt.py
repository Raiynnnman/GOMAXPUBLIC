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
parser.add_argument('--value', dest="value", action="store")
args = parser.parse_args()

enc = encryption.decrypt(args.value, config.getKey("encryption_key"))
print(enc)
