
use pain;
alter table pricing_data add column (stripe_product_id varchar(64) unique);
