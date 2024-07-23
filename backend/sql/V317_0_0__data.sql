

alter table position_zip add column (tz_name varchar(255));
alter table position_zip add column (tz_minutes float not null default 0);
alter table position_zip add column (tz_hours float not null default 0);
