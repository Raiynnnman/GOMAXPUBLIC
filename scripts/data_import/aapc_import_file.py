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

if not args.file:
    print("--file required")
    sys.exit(1)
print("processing %s" % args.file)

H=open(args.file,"rb")
R=H.read()
H.close()

R=R.decode('utf-8',errors="ignore")
cpt = os.path.basename(args.file)
# print(cpt)

arr = R.split(">")
l = len(arr)
c = 0
S_F = False
desc = ''
while c < l:
    t = arr[c]
    # print("---")
    # print("t=%s" % t)
    if t.startswith("Summary"):
        # print(t)
        S_F = True
    if 'collapse_offlongdesc' in t:
        # print("coll=%s" % t)
        S_F = True
    if S_F and '</b' in t: 
        desc = t
        desc = desc.replace("</b","")
        # print("desc2=%s" % desc)
        break
    if S_F and '<p' in t: 
        # print("+1",arr[c+1])
        if 'Call 844' in arr[c+1]:
            c += 1
            continue
        desc = arr[c+1]
        desc = desc.split("<")
        desc = desc[0]
        print("desc=%s" % desc)
        break
    c += 1

if not S_F:
    desc = "No summary found for this code."

if len(desc) < 1 and 'No Summary found for this code' in R:
    desc = "No summary found for this code."

if len(desc) > 2047:
    print("WARNING: desc is larger than 2047")
if len(desc) < 1:
    print("WARNING: desc is 0")
desc = desc.replace("'","''")
q = "insert into icd_cpt (icd_year_id,code,description) values "
q += "(%s,'%s','%s');\n" % (1,cpt,desc)
H=open("aapc.sql","a")
H.write(q)
H.close()
