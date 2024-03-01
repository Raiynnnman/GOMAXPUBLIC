
use pain;
alter table stripe_invoice_status add column (stripe_fee float not null default 0);
