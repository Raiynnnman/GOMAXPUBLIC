
use pain;

insert into office_type (id,name) values (6,'MRI');

insert into office (name,office_type_id,active) values 
('3T Radiology',6,1);

set @v = LAST_INSERT_ID();
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v,'3T RADIOLOGY', '20803 BISCAYNE BLVD', 'AVENTURA' ,'FL', 33180),
(@v,'3T RADIOLOGY', '9050 PINES BLVD SUITE 160','PEMBROKE PINES' , 'FL', 33024), 
(@v,'3T RADIOLOGY', '210 S FEDERAL HIGHWAY','HOLLYWOOD',  'FL', 33020),
(@v,'3T RADIOLOGY', '4515 WILES RD UNIT 101','COCONUT CREEK' , 'FL', 33073);
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);

insert into office (name,office_type_id,active) values 
('PAN AM DIAGNOSTICS',6,1);
set @v = LAST_INSERT_ID();
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v,'PAN AM DIAGNOSTICS', '1820 N. UNIVERSITY DRIVE', 'PEMBROKE PINES', 'FL', 33024),
(@v,'PAN AM DIAGNOSTICS', '6421 MILNER BOULEVARD #1,', 'ORLANDO','FL', 32809);


insert into office (name,office_type_id,active) values 
('SOUTH MIAMI OPEN MRI',6,1);
set @v = LAST_INSERT_ID();
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v,'SOUTH MIAMI OPEN MRI', '6161 SW 72ND ST', 'SOUTH MIAMI', 'FL', 33143);

insert into office (name,office_type_id,active) values 
('CT MRI OF SOUTH FLORIDA',6,1);
set @v = LAST_INSERT_ID();
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v, 'CT MRI OF SOUTH FLORIDA', '1 TAMIAMI CANAL RD', 'MIAMI', 'FL', 33144);

insert into office (name,office_type_id,active) values 
('BROADER MRI OF PALM BEACH',6,1);
set @v = LAST_INSERT_ID();
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v,'BROADER MRI OF PALM BEACH', '5405 OKEECHOBEE BLVD #101 B', 'WEST PALM BEACH', 'FL', 33417);


insert into office (name,office_type_id,active) values 
('PRIME IMAGING',6,1);
set @v = LAST_INSERT_ID();
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v,'PRIME IMAGING', '403 S KIRKMAN RD SUITE B', 'ORLANDO', 'FL',32811);

insert into office (name,office_type_id,active) values 
('PORT SAINT LUCIE IMAGING',6,1);
set @v = LAST_INSERT_ID();
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v, 'PORT SAINT LUCIE IMAGING', '2992 SW PORT SAINT LUCIE BOULEVARD', 'PORT SAINT LUCIE', 'FL', 34953);

insert into office (name,office_type_id,active) values 
('CLEARVIEW IMAGING',6,1);
set @v = LAST_INSERT_ID();
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v,'CLEARVIEW IMAGING', '3707 W HAMILTON AVE #B', 'TAMPA', 'FL', 33614);


insert into office (name,office_type_id,active) values 
('INSITE RADIOLOGY',6,1);
set @v = LAST_INSERT_ID();
insert into provider_queue(office_id,provider_queue_status_id,provider_queue_lead_strength_id)
values (@v,1,4);
insert into office_addresses(office_id,name,addr1,city,state,zipcode) values
(@v,'INSITE RADIOLOGY', '1740 EDGEWOOD AVE W', 'JACKSONVILLE', 'FL', 32208);
