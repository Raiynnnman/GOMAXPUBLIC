
use pain;
create table calendar_bookings (
    id int primary key auto_increment,
    email varchar(255),
    phone varchar(255),
    description mediumtext,
    timezone varchar(255),
    offset float,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
