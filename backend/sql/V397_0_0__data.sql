
use pain;
alter table provider_queue add column (set_to_present_date date);
alter table provider_queue add column (
    business_name varchar(255),
    doing_business_as_name varchar(255)
);
