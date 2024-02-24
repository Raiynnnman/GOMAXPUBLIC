
use pain;

create table provider_queue_status (
    id int primary key auto_increment,
    name varchar(255)
);

insert into provider_queue_status (id,name) values 
(1,'QUEUED'),
(2,'WAITING'),
(3,'APPROVED'),
(4,'DENIED');

create table provider_queue (
    id int primary key auto_increment,
    office_id int,
    provider_queue_status_id int not null default 1,
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (provider_queue_status_id) REFERENCES provider_queue_status(id)
);

alter table office_addresses add column (name varchar(255));
