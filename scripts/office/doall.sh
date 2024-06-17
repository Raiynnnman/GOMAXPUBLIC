#!/bin/sh

ext=.py
if [ -f office/__init__.pyc ]; then
    ext=.pyc
fi

T="
    office/office_notifications__null_addr \
	office/office_notifications__has_addr \
    office/office_notifications__no_addr \
    office/office_notifications__null_city \
    office/office_notifications__has_city \
    office/office_notifications__no_city \
    office/office_notifications__null_state \
    office/office_notifications__has_state \
    office/office_notifications__no_state \
    office/office_notifications__null_zipcode \
    office/office_notifications__has_zipcode \
    office/office_notifications__no_zipcode  \
"

for x in $T; do
    echo $x
    python $x$ext
    if [ $? != "0" ]; then exit 1; fi
done
