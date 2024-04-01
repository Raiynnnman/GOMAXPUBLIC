# coding=utf-8

import os
import sys
import unittest
import ipaddress
import json
import time
import sqlite3
import datetime
import copy
import base64
sys.path.append(os.getcwd())  # noqa: E402
from ua_parser import user_agent_parser
from util import calcdate, encryption
from flask import request
from util.DBOps import Query
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--dryrun', dest="dryrun", action="store_true")
parser.add_argument('--ip', dest="ip", action="store")
args = parser.parse_args()

con = None
if os.path.exists("bin/data/ipmapping.db"):
    F="bin/data/ipmapping.db"
    con = sqlite3.connect(F, check_same_thread=False)

ip = args.ip
j = {}
if con is not None and ip is not None:
    curs = con.cursor()
    g = int(ipaddress.ip_address(ip))
    print(g)
    q = """select 
            latitude, longitude, continent, 
            country, stateprov, city 
           from dbip_lookup where ? between ip_st_int and ip_en_int
        """
    curs.execute(q, (g,))
    for n in curs:
        print(n)
        j['location'] = {'lat': n[0], 'lon': n[1]}
        j['continent'] = n[2]
        j['country'] = n[3]
        j['stateprov'] = n[4]
        j['city'] = n[5]
        break
else:
    print("No database to pull from")
