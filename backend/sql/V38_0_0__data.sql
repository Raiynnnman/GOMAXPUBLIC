
use pain;
alter table traffic_cities add column (
    tz int not null default 14
);

update traffic_cities set tz = 22 where state = 'FL';
