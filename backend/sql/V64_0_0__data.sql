
use pain;
alter table office_plans add column (stripe_product_id2 varchar(64));
update office_plans set stripe_product_id2 = stripe_product_id;
alter table office_plans drop column stripe_product_id;
alter table office_plans add column (stripe_product_id varchar(64));
update office_plans set stripe_product_id = stripe_product_id2;
alter table office_plans drop column stripe_product_id2;

