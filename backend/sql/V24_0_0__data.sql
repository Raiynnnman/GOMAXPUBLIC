
use pain;
create table if not exists office_type (
    id int primary key auto_increment,
    name varchar(255)
);
insert into office_type (id,name) values (1,'Provider'),(2,'Legal'),(3,'Patient');
alter table office drop column dhd_id;
alter table office add column (
    office_type_id int,
    FOREIGN KEY (office_type_id) REFERENCES office_type(id)
);
update office set office_type_id = 1;
