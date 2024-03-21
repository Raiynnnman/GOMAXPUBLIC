
use pain;

create table client_intake_status (
    id int primary key auto_increment,
    name varchar(255)
);

insert into client_intake_status (id,name) values
(1,'ASSIGNED'),
(10,'SCHEDULED'),
(20,'COMPLETED'),
(30,'NO_SHOW');

alter table client_intake add column (
    client_intake_status_id int,
    FOREIGN KEY (client_intake_status_id) REFERENCES client_intake_status(id)
);

update client_intake set client_intake_status_id = 1;
