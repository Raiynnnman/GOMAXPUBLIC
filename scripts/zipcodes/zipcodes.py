#!/usr/bin/python

import os
import sys
import jwt
import zipfile
import io
import unicodecsv as csv


sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate
import argparse


config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

arr = os.listdir("zipcodes/.")

if args.file:
    arr = [args.file]

def checkValue(v):
    if v is None or len(str(v)) == 0:
        return "''"
    if "'" in v:
        v = v.replace("'","\\'")
    return "'%s'" % v
ZIPS=[]
for x in arr:
    if not x.endswith("zip"):
        continue
    H = open("zipcodes/%s" % x,"rb")
    f = io.BytesIO(H.read())
    H.close()
    z = zipfile.ZipFile(f)
    for j in z.infolist():
        if 'readme' in j.filename:
            continue
        cont = z.read(j.filename)
        csv = csv.reader(io.BytesIO(cont),encoding='utf-8',delimiter='\t')
        print("use dhd;")
        for q in csv:
            q = """insert into position_zip (
                country_code,zipcode,name,
                name1,code1,
                name2,code2,name3,code3,
                lat,lon,accuracy) values (
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
                );
                """ % (
                    checkValue(q[0]),
                    checkValue(q[1]),
                    checkValue(q[2]),
                    checkValue(q[3]),
                    checkValue(q[4]),
                    checkValue(q[5]),
                    checkValue(q[6]),
                    checkValue(q[7]),
                    checkValue(q[8]),
                    checkValue(q[9]),
                    checkValue(q[10]),
                    checkValue(q[11]) if len(str(checkValue(q[11]))) < 1 else 0
                    
                )
            q = q.replace("\n","")
            q = q.replace("\t","")
            print(q)
            
    break
