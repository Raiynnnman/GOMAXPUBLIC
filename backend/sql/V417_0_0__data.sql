
use pain;
alter table jobs add column (is_storage_job int not null default 0);
