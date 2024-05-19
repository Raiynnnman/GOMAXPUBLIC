
use pain;
alter table referrer_users add column (sha256 varchar(64) unique);
