
use pain;


create table traffic_zipcodes (
    id int primary key auto_increment,
    city varchar(255),
    state varchar(255),
    zipcode int,
    disabled int not null default 0,
    nextcheck TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

insert into traffic_zipcodes (city,state,zipcode) values ('Orlando','FL',32903);
insert into traffic_zipcodes (city,state,zipcode) values ('Orlando','FL',32801);
insert into traffic_zipcodes (city,state,zipcode) values ('Orlando','FL',33024);
insert into traffic_zipcodes (city,state,zipcode) values ('Houston','TX',77089);
