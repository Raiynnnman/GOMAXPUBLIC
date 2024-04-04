#!/bin/sh

ext=.py
if [ -f stripe/__init__.pyc ]; then
    ext=.pyc
fi

T="
    salesforce/sf_user \
"

for x in $T; do
    echo $x
    python $x$ext
    if [ $? != "0" ]; then exit 1; fi
done
