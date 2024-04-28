
use pain;

create table office_hours (
    id int primary key auto_increment,
    office_id int,
    day int,
    type varchar(10),
    time int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id)
);
