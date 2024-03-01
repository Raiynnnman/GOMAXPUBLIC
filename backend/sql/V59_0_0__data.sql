
use pain;
alter table invoices add column (billing_period DATE);
update invoices set billing_period = '2024-03-01';
