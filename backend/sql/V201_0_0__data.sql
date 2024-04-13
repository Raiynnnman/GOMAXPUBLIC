
use pain;
alter table invoices add column (version not null default 0);
