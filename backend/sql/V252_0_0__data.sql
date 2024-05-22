
use pain;

create table system_settings(
    id int primary key auto_increment,
    name varchar(255) unique,
    value int
);

insert into system_settings(name,value) values ('do_billing_charge',1);

create table office_phones (
    id int primary key auto_increment,
    office_id int,
    phone varchar(64),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
