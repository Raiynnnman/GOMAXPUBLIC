#!/bin/sh

ext=.py
if [ -f stripe/__init__c ]; then
    ext=.pyc
fi

T="stripe/stripe_customers \
    stripe/stripe_accounts_consultants \
    stripe/stripe_accounts_offices \
    stripe/stripe_tos \
    stripe/generate_invoices \
    stripe/invoice_submit \
    stripe/stripe_invoice_status \
    stripe/stripe_progress_invoice \
    stripe/office_fee_geninvoice \
    stripe/consultant_fee_geninvoice \
    stripe/office_transfer_funds \
    stripe/consultant_transfer_funds \
    stripe/office_payout_funds \
    stripe/consultant_payout_funds \
"

for x in $T; do
    echo $x
    python $x$ext
    if [ $? != "0" ]; then exit 1; fi
done
