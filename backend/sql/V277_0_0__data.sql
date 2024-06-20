
update pricing_data set plan_summary = 'Designed for established practices seeking comprehensive support.' 
    where plan_summary = ' Designed for established practices seeking comprehensive support and enhanced capabilities.';

delete from pricing_data_benefits where description='Hassle-free Autopay Billing';

insert into pricing_data_benefits(pricing_data_id,description,slot) values 
(37,'10 mile exclusivity radius',5),
(38,'7 mile exclusivity radius',5),
(39,'5 mile exclusivity radius',5);

