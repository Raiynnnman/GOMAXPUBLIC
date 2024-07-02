
use pain;
insert into provider_queue_status (id,name) values
(43,'DUPLICATE');

create table provider_queue_actions_type 
(
    id int primary key auto_increment,
    name varchar(255)
);
create table provider_queue_actions_status
(
    id int primary key auto_increment,
    name varchar(255)
);
alter table provider_queue_actions add column (
    provider_queue_actions_type_id int,
    provider_queue_actions_status_id int,
    FOREIGN KEY (provider_queue_actions_type_id) REFERENCES provider_queue_actions_type(id),
    FOREIGN KEY (provider_queue_actions_status_id) REFERENCES provider_queue_actions_status(id)
);
    
insert into provider_queue_actions_type (id,name) values
(1,'Appointment'),
(2,'Email'),
(3,'Call');
