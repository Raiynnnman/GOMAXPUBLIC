
use pain;

/* Import had a bug, reset all invoices */

delete from invoices_comment;
delete from invoice_history;
delete from invoice_items;
delete from stripe_invoice_status;
delete from invoices;

