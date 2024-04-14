
use pain;
alter table office add column (hubspot_id varchar(255) unique);
alter table users add column (hubspot_id varchar(255) unique);
