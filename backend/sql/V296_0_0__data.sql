
use pain;


create table office_alternate_status (
    id int primary key auto_increment,
    name varchar(255)
);

insert into office_alternate_status (id,name) values 
('1','PATIENT_BEFORE_BUY'),
('2','ADDRESS_MISSING');

alter table office add column (
    office_alternate_status_id int,
    FOREIGN KEY (office_alternate_status_id) REFERENCES office_alternate_status(id)
);
