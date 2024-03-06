#!/bin/sh

ext=.py
if [ -f stripe/__init__c ]; then
    ext=.pyc
fi

T="stripe/stripe_customers \
    stripe/stripe_customer_update \
    stripe/registration_invoices \
    stripe/registration_initial_payment \
    stripe/invoice_totals \
    stripe/generate_invoices \
    stripe/invoice_submit \
    stripe/stripe_invoice_status \
    stripe/stripe_progress_invoice 
"

for x in $T; do
    echo $x
    python $x$ext
    if [ $? != "0" ]; then exit 1; fi
done
