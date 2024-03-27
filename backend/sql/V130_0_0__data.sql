
use pain;
alter table client_intake add column (hidden int not null default 0);


update pricing_data set active = 0;
alter table pricing_data add column (upfront_cost float not null default 0);

insert into pricing_data (description,locations,duration,upfront_cost,price,slot,start_date,end_date,active, trial, toshow, customers_required)
values
('#PAIN Annual Subscription',3,12,299,399,1,now(),date_add(now(),INTERVAL 12 month),1,0,1,1),
('#PAIN 6 Month Subscription',3,6,333,399,2,now(),date_add(now(),INTERVAL 12 month),1,0,1,1),
('#PAIN 3 Month Subscription',3,3,399,399,3,now(),date_add(now(),INTERVAL 12 month),1,0,1,1),
('#PAIN Introductory 3 Month Subscription',3,3,333,399,1,now(),date_add(now(),INTERVAL 12 month),1,0,0,1),
('#PAIN Introductory Setup',3,1,199,399,1,now(),date_add(now(),INTERVAL 12 month),1,0,0,1),
('#PAIN In-Network',3,1,0,0,1,now(),date_add(now(),INTERVAL 12 month),1,1,0,1);

