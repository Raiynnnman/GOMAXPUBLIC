
use pain;
alter table office_phones add column (deleted int not null default 0);
