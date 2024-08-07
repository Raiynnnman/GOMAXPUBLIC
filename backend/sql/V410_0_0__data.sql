
use pain;
alter table referrer_users add column (update_cntr int not null default 0);
