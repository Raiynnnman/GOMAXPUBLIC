#!/bin/sh

ext=.py
if [ -f stripe/__init__c ]; then
    ext=.pyc
fi

T="stripe/stripe_customers \
    stripe/stripe_customer_update.py \
    stripe/registration_invoices.py \
    stripe/registration_initial_payment.py \
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
