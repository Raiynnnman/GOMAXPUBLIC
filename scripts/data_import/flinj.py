#!/usr/bin/python
import os
import sys
import json
import pyap


H=open("../backend/flinj2.json","r")
js=H.read()
js=json.loads(js)

for x in js:
    print(x)
    a = x['address']
    if 'latitude' not in x:
        continue
    lat = x['latitude']
    lon = x['longitude']
    print("s=%s" % a)
    # a = a.replace('&amp;','&')
    ph = ''
    if 'CALL' in a:
        ph = a.split('CALL')
        a = ph[0]
        ph = ph[1]
        print("ph=%s" % ph)
    print("a=%s" % a)
    a2 = a
    n = ''
    c = 0
    print("a2=%s" % a2)
    for g in a:
        if g.isdigit():
          break  
        n += g
        a2 = a2[1:]
        print("n=%s" % n)
        print("a2=%s" % a2)
    c += 1
    print('a/p/n=%s/%s/%s' % (a2,ph,n))
    print("parsing=%s" % a2)
    addr = pyap.parse(a2,country='US') 
    if len(addr) < 1:
        print("ERROR: parse came back false")
        continue
    print("res=%s" % addr)
    parsed_address = addr[0]
    print(parsed_address)
    street = parsed_address.street_number + " " + parsed_address.street_name
    city = parsed_address.city
    state = parsed_address.region1
    postal_code = parsed_address.postal_code
    n = n.lstrip().rstrip()
    ph = ph.lstrip().rstrip()
    print("""
        insert into office_addresses (office_id,name,phone,addr1,city,state,zipcode,lat,lon) values (@v,'%s','%s','%s','%s','%s','%s',%s,%s);
        """ % (n,ph,street,city,state,postal_code,lat,lon)
    )
    # print(x)
