#!/usr/bin/python
import os
import sys
import pandas as pd
import PyPDF2

tables = pd.read_excel(sys.argv[1],converters={'CARRIER':str,'ZIP CODE':str})
print(tables)
df = tables
df = df.fillna(0)
q = """
    insert into medicare_city_codes(state,zipcode,carrier,locality,rural,labcb_locality,
        rural2,plus4flag,partbdrug,year,start_date,end_date) values"""
H=open("out.sql","w")
H.write(q)
H.write('\n')
print(q)
for row in df.itertuples(index=True, name='Pandas'):
    d = list(row)
    G = []
    d.pop(0)
    for x in d:
        j = x
        if j == 'nan':
            j = 0
        j = "'%s'" % x
        j = j.replace("20233","2023")
        j = j.replace('.0','')
        G.append(j)
    G.append("'2023-01-01'")
    G.append("'2023-12-31'")
    F = "(%s),\n" % ",".join(G)
    H.write(F)
    print(F)

H.close()
