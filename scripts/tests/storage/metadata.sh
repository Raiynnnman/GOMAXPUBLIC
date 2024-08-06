#!/bin/sh
source p/bin/activate || . p/bin/activate
EXT=.py
if [ -f bin/get_api_url.pyc ]; then
    EXT=.pyc
fi 
URL=`python bin/get_api_url$EXT`
curl $URL/metadata_refresh
