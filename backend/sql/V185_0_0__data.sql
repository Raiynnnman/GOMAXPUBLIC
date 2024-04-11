
use pain;
alter table provider_queue add column (sf_executed int not null default 0);
