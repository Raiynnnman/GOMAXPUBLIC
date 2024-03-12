
use pain;
alter table traffic_zipcodes add column (zipcode2 varchar(255));
update traffic_zipcodes set zipcode2 = zipcode;
alter table traffic_zipcodes drop column zipcode;
alter table traffic_zipcodes add column (zipcode varchar(255));
update traffic_zipcodes set zipcode = zipcode2;
alter table traffic_zipcodes drop column zipcode2;
