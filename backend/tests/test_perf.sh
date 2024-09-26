#!/bin/bash

JS=$1
EP=$2

curl -XPOST -d@$JS \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InBhdWxAcG91bmRwYWluLmNvbSIsInVzZXJfaWQiOjEwMH0.cwxOUXfFCrAysfyWYDBE-0XVOSUhLkw6MFDhHns0Q54'\
    https://api.poundpain.com$2
