
use pain;
alter table pricing_data add column (stripe_tax_code varchar(64));
alter table office_plans add column (stripe_tax_code varchar(64));

update office_plans set stripe_tax_code = 'txcd_10000000';
update pricing_data set stripe_tax_code = 'txcd_10000000';
