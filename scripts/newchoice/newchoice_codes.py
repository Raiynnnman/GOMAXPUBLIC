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
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

H = open(args.file,"r")
cont = H.read()
H.close()

arr = cont.split("</div>")

DPTI=0
DPTI_NAME=0
DPI=0
C = 0
for x in arr:
    # print(x)
    j = x.split("<")
    for t in j:
        if t.startswith("/"):
            continue
        # print(t)
        if 'procedure-detail' in t:
            q = t.split("data-procedure_type_id")
            DPTI = q[1].split(" ")
            DPTI = DPTI[0]
            DPTI = DPTI.replace('"',"")
            DPTI = DPTI.replace('=',"")
            #print("DPTI=%s" % DPTI)
        if 'procedure-title' in t:
            q = t.split(">")
            DPTI_NAME=q[1]
            #print("DPTI_NAME=%s" % DPTI_NAME)
            print("insert into procedures (id,name) values (%s,'%s');" % (DPTI,DPTI_NAME))
        if 'data-procedure_id' in t:
            q = t.split(">")
            name = q[1]
            q = q[0].split("data-procedure_id")
            q = q[1]
            q = q.replace("\"","")
            q = q.replace("=","")
            print("insert into subprocedures (id,procedures_id,name) values (%s,%s,'%s');" % (q,DPTI,name))
            

