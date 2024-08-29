
alter table user_addresses add column (nextcheck DATETIME,lat_attempt_count int not null default 0);
