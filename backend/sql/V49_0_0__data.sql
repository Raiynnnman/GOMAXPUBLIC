
use pain;

alter table pricing_data add column (description varchar(255));

update pricing_data set description = 'January 2024 Annual Subscription' where id = 1;
update pricing_data set slot=2,description = 'January 2024 6 month Subscription' where id = 2;
update pricing_data set slot=3,description = 'January 2024 1 month Subscription' where id = 3;

insert into traffic_zipcodes (city,state,zipcode) values ('Renton','WA',98058);
