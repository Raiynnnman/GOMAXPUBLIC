
use pain;
alter table provider_queue add column (ip2 float);
update provider_queue set ip2=initial_payment;
alter table provider_queue drop initial_payment;
alter table provider_queue add column (initial_payment float);
update provider_queue set initial_payment=ip2;
alter table provider_queue drop ip2;
