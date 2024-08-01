
use pain;
drop table calendar_bookings;
create table calendar_bookings (
    id int primary key auto_increment,
    email varchar(255),
    phone varchar(255),
    description mediumtext,
    day date,
    sent int not null default 0,
    time varchar(255),
    timezone varchar(255),
    offset float,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into jenkins_jobs(class,job) values ('CalendarBooking','calendar-booking');
