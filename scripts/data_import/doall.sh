#!/bin/sh

ext=.py
if [ -f stripe/__init__.pyc ]; then
    ext=.pyc
fi

T="
    data_import/no_results_zipcode \
    data_import/performance_location \
    data_import/phone_masking \
    data_import/state_values
"

for x in $T; do
    echo $x
    python $x$ext
    if [ $? != "0" ]; then exit 1; fi
done
