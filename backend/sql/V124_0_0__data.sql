
use pain;
alter table office_addresses add column (lat_attempt_count int not null default 0);
