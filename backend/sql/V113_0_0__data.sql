
use pain;
alter table office add column (old_stripe_cust_id varchar(255));
update office set old_stripe_cust_id = stripe_cust_id where billing_system_id=1;
