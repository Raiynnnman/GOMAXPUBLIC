
use pain;
alter table office add column (migrated_stripe int not null default 0);
update office set migrated_stripe = 1 where active = 1;
