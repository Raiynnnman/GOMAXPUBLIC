
use pain;

create table traffic_cities (
    id int primary key auto_increment,
    city varchar(255) unique,
    state varchar(255),
    disabled int not null default 0,
    nextcheck TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

insert into traffic_cities (city,state) values ('Orlando','FL');
insert into traffic_cities (city,state) values ('Houston','TX');
