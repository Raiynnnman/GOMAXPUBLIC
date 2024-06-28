
use pain;
alter table office_addresses add column (deleted int not null default 0);
