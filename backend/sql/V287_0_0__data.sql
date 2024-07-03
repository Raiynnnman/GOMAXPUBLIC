
use pain;

drop table office_phones;

create table office_phones (
    id int primary key auto_increment,
    iscell int not null default 1,
    office_id int,
    phone varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into office_phones (office_id,phone) 
    select office_id,phone from office_addresses; 
