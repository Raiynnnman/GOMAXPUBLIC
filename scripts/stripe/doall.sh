#!/bin/sh

ext=.py
if [ -f stripe/__init__.pyc ]; then
    ext=.pyc
fi

T="
    square/square_customers \
    square/square_customer_update \
    stripe/registration_invoices \
    stripe/registration_initial_payment \
    stripe/invoice_totals \
    stripe/generate_invoices \
    square/invoice_submit \
    square/square_invoice_status \
    square/square_progress_invoice 
"

for x in $T; do
    echo $x
    python $x$ext
    if [ $? != "0" ]; then exit 1; fi
done
