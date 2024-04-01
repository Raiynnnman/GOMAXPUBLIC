
use pain;
alter table referrer_users add column (zipcode varchar(64));
alter table referrer_documents add column (sha varchar(64) unique);
