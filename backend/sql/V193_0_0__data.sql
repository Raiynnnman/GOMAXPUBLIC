
use pain;
create table provider_queue_sf_status (
    id int primary key auto_increment,
    name varchar(64)
);

insert into provider_queue_sf_status (id,name) values (1,'New');
insert into provider_queue_sf_status (id,name) values (10,'Working');
insert into provider_queue_sf_status (id,name) values (20,'Nurturing');
insert into provider_queue_sf_status (id,name) values (30,'Converted');
insert into provider_queue_sf_status (id,name) values (40,'Complete');

alter table provider_queue add column (
    provider_queue_sf_status_id int,
    FOREIGN KEY (provider_queue_sf_status_id) REFERENCES provider_queue_sf_status(id)
)

