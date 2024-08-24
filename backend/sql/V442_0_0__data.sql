
insert into office_type (name) values 
('Orthopedic / Neurology'),
('Pain Management'),
('Primary Care Provider (PCP)'),
('Diagnostics / MRI'),
('Mental Health');

insert into provider_queue_status (id, name) values (100,'IN_NETWORK');
update provider_queue set provider_queue_status_id = 100 where provider_queue_status_id=50;

insert into provider_queue_status (id, name) values (41,'MISSING_INFORMATION');
update provider_queue set provider_queue_status_id = 41 where office_id in (
    select id from office where office_alternate_status_id = 3
);

update provider_queue set provider_queue_status_id = 5 where office_id in (
    select id from office where office_alternate_status_id in 
    (8,9,10,11,12,13,15,16,17,18,19,20,21,23,24,25,26,27,28,29,32,33)
);

insert into provider_queue_status (id, name) values (44,'NOT_A_CHIROPRACTOR');
update provider_queue set provider_queue_status_id = 41 where office_id in (
    select id from office where office_alternate_status_id = 4
);

insert into provider_queue_status (id, name) values (46,'NO_PI');
update provider_queue set provider_queue_status_id = 44 where office_id in (
    select id from office where office_alternate_status_id = 5
);

update provider_queue set provider_queue_status_id = 42 where office_id in (
    select id from office where office_alternate_status_id = 6
);

insert into provider_queue_status (id, name) values (47,'NOT_INTERESTED');
update provider_queue set provider_queue_status_id = 47 where office_id in (
    select id from office where office_alternate_status_id = 7
);

insert into provider_queue_status (id, name) values (48,'REQUIRES_PATIENT');
update provider_queue set provider_queue_status_id = 48 where office_id in (
    select id from office where office_alternate_status_id = 14
);

insert into provider_queue_status (id, name) values (49,'REQUIRES_RAIN');
update provider_queue set provider_queue_status_id = 49 where office_id in (
    select id from office where office_alternate_status_id = 32
);

update provider_queue_status set name = 'REQUIRES_REFERENCE' where id = 50;
update provider_queue set provider_queue_status_id = 50 where office_id in (
    select id from office where office_alternate_status_id = 34
);

insert into provider_queue_status (id, name) values (51,'PAYMENT_COMMITTED');
update provider_queue set provider_queue_status_id = 51 where office_id in (
    select id from office where office_alternate_status_id in (30,31)
);
