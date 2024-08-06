#!/bin/sh
source p/bin/activate || . p/bin/activate
EXT=.py
if [ -f bin/get_api_url.pyc ]; then
    EXT=.pyc
fi 
KEY=`python bin/get_api_key$EXT`
URL=`python bin/get_api_url$EXT`
curl -XPOST -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
    --data @tests/storage/exampletable.json $URL/storage/update
