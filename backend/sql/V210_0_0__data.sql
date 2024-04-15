
use pain;
alter table coupons add column (active int not null default 0);
update coupons set active = 1;
