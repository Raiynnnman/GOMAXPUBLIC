
alter table visits add column (
    lat float not null default 0,
    lng float not null default 0,
    continent varchar(255),
    country varchar(255),
    ip varchar(255),
    ip_int int,
    state varchar(255),
    city varchar(255)
);
