#!/bin/sh

ext=.py
if [ -f office/__init__.pyc ]; then
    ext=.pyc
fi

T=" \
    office/office_notifications_has_null_field \
	office/office_notifications_has_addr \
    office/office_notfications_has_city \
    office/office_notfications_has_city \
    office/office_notfications_has_zipcode \
    office/office_notfications_no_city \
    office/office_notfications_no_state \
    office/office_notfications_no_addr \
    office/office_notfications_no_zipcode \
"

for x in $T; do
    echo $x
    python $x$ext
    if [ $? != "0" ]; then exit 1; fi
done
