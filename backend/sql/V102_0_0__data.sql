
use pain;

create table provider_queue_lead_strength (
    id int primary key auto_increment,
    name varchar(255)
);

insert into provider_queue_lead_strength (id,name) values
(1,'Preferred Provider'),
(2,'In-Network Provider'),
(3,'Potential Provider');

alter table provider_queue add column (
    provider_queue_lead_strength_id int,
    FOREIGN KEY (provider_queue_lead_strength_id) REFERENCES provider_queue_lead_strength(id)
);

update provider_queue set provider_queue_lead_strength_id = 1;
