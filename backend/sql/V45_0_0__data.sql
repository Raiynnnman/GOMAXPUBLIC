
use pain;
drop table visits;
create table visits (
    id int primary key auto_increment,
    office_type_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (office_type_id) REFERENCES office_type(id)
);
