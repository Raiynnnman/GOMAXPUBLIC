
use pain;
alter table invoices add column (stripe_tax_id varchar(64));
update invoices set stripe_tax_id='txcd_10000000';

insert into provider_queue_status (id,name) values (20,'WAITING');
update provider_queue set provider_queue_status_id=20 where provider_queue_status_id=2;
delete from provider_queue_status where id=2;

insert into provider_queue_status (id,name) values (30,'APPROVED');
update provider_queue set provider_queue_status_id=30 where provider_queue_status_id=3;
delete from provider_queue_status where id=3;

insert into provider_queue_status (id,name) values (40,'DENIED');
update provider_queue set provider_queue_status_id=40 where provider_queue_status_id=4;
delete from provider_queue_status where id=4;
