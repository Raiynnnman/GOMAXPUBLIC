
use pain;
alter table office_cards add column (sync_retries int not null default 0);
