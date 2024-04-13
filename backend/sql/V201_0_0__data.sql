
use pain;
alter table invoices add column (version int not null default 0);
