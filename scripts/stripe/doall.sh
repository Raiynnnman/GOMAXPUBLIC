#!/bin/sh

ext=.py
if [ -f stripe/__init__.pyc ]; then
    ext=.pyc
fi

T="
    square/square_customers \
    stripe/registration_invoices \
    square/invoice_submit \
    stripe/stripe_invoice_status \
    square/square_invoice_status \
    stripe/stripe_progress_invoice \
    square/square_progress_invoice  \
    stripe/invoice_totals
"

for x in $T; do
    echo $x
    python $x$ext
    if [ $? != "0" ]; then exit 1; fi
done
