
use pain;

create table search_no_results (
    id int primary key auto_increment,
    sha varchar(128),
    lat float,
    lon float,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

alter table user_addresses add column (zipcode varchar(64));
update user_addresses set zipcode=zip;
alter table user_addresses drop zip;
