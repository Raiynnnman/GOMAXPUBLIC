
use pain;

delete from stub_car_makes where year < 2006;
update traffic_incidents set traffic_incidents_contact_id = null;
delete from traffic_incidents_contact;
