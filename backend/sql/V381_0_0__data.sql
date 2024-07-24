
use pain;
update traffic_cities set disabled = 1;
update traffic_cities set disabled = 0 where state = 'FL';
update traffic_cities set disabled = 0 where state = 'FL';
delete from traffic_zipcodes where city = 'Renton';
delete from traffic_zipcodes where city = 'Orlando';
delete from traffic_zipcodes where city = 'Arlington';
