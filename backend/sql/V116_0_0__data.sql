
use pain;
alter table pricing_data add column (trial int not null default 0); 
alter table pricing_data add column (toshow int not null default 1); 


insert into pricing_data (price,locations,duration,slot,start_date,end_date,trial,toshow,active,description)
values
(0,99,12,1,now(),date_add(now(),INTERVAL 12 MONTH),1,0,1,'In-Network Access');
