#!/usr/bin/python

import os
import sys
import argparse

sys.path.append(os.getcwd())  # noqa: E402

from common import settings

config = settings.config()
config.read("settings.cfg")

print(config.getKey("celery_queue_prefix"))
