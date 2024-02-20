#!/usr/bin/python
import os
import sys
import pandas as pd
import PyPDF2

sys.path.append(os.getcwd())  # noqa: E402

from common import settings
from util import encryption,calcdate,getIDs
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--locality', dest="locality", action="store")
parser.add_argument('--state', dest="state", action="store")
parser.add_argument('--file', dest="file", action="store")
args = parser.parse_args()

if args.locality is None or len(args.locality) < 1:
    print("Locality required")
    sys.exit(1)
if args.file is None or len(args.file) < 1:
    print("file required")
    sys.exit(1)

tables = pd.read_excel(args.file,converters={
    'PROC CODE':str,'FAC IND':str,'OPPS CAP IND':str,'MODIFIER':str,
    'PAR FEE':str,'NON PAR FEE':str,'LC':str
    }
)
print(tables)
df = tables
df = df.fillna(0)
q = """
    insert into medicare_fee_schedule(
        medicare_city_codes_id,state,icd_cpt_id,facility_indicator,
        opps_cap_ind,modifier,participating_fee,
        non_participating_fee,limiting_charge,
        start_date,end_date) values"""
H=open("out.sql","w")
H.write(q)
H.write('\n')
print(q)
TOTAL = 0
FAILED = 0
CPT=getIDs.getCPTCodes()
for row in df.itertuples(index=True, name='Pandas'):
    TOTAL += 1
    d = list(row)
    d.pop(0)
    if len(d) < 7:
        continue
    G = [args.locality,"'%s'" % args.state]
    # print(d)
    proc = d[2]
    if proc == 0:
        continue
    if proc not in CPT:
        print("ERROR: Code %s doesnt exist" % proc)
        FAILED += 1
        continue
    cpt = CPT[proc]
    # print(proc,cpt)
    print(d)
    G.append("'%s'" % cpt)
    G.append("'%s'" % d[0])
    G.append("'%s'" % d[1])
    # G.append("'%s'" % d[2])
    G.append("'%s'" % d[3])
    G.append("'%s'" % d[4])
    G.append("'%s'" % d[5])
    G.append("'%s'" % d[6])
    G.append("'2023-01-01'")
    G.append("'2023-12-31'")
    # print(G)
    F = "(%s),\n" % ",".join(G)
    H.write(F)
    # print(F)

H.close()
print("Import complete")
print("Total=%s,Failed=%s" % (TOTAL,FAILED))
