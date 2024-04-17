
use pain;
alter table office add column (sm_id varchar(255) unique);
alter table provider_queue add column (sm_id varchar(255) unique);
alter table users add column (sm_id varchar(255) unique);
