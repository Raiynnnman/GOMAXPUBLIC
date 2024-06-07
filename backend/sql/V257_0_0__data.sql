
use pain;
update pricing_data set active = 0, toshow=0;
alter table pricing_data add column (plan_summary varchar(512));
alter table pricing_data add column (contact_page int not null default 0);
delete from pricing_data_benefits;

insert into pricing_data(
price,duration,slot,toshow,start_date,end_date,active,customers_required,upfront_cost,office_type_id,description,plan_summary
)
values
(500,12,0,1,now(),date_add(now(),interval 12 month),1,1,500,1,'Professional Plan',
'Designed for established practices seeking comprehensive support and enhanced capabilities.');
set @v = LAST_INSERT_ID();
insert into pricing_data_benefits(pricing_data_id,description,slot) values
(@v,'- 12 Month Plan: $500/month',0),
(@v,'- Features:',1),
(@v,'- Auto Scheduling - First Appointment',2),
(@v,'- Lower Marketing CoA, Higher ROI',3), 
(@v,'- Powerful, Targeted Advertising Co-Op',4),
(@v,'- Hassle-free Autopay Billing',5),
(@v,'- Renews Every 12 Months',6);


insert into pricing_data(price,duration,slot,toshow,start_date,end_date,active,customers_required,upfront_cost,office_type_id,description,plan_summary)
values
(700,6,1,1,now(),date_add(now(),interval 12 month),1,1,700,1,'Growth Plan',
'Ideal for growing practices looking to expand their patient base.');
set @v = LAST_INSERT_ID();
insert into pricing_data_benefits(pricing_data_id,description,slot) values
(@v,'- 6 Month Plan: $700/month',0),
(@v,'- Features:',1),
(@v,'- Auto Scheduling - First Appointment',2),
(@v,'- Lower Marketing CoA, Higher ROI',3), 
(@v,'- Powerful, Targeted Advertising Co-Op',4),
(@v,'- Hassle-free Autopay Billing',5),
(@v,'- Renews Every 12 Months',6);



insert into pricing_data(price,duration,slot,toshow,start_date,end_date,active,customers_required,upfront_cost,office_type_id,description,plan_summary)
values
(850,3,2,1,now(),date_add(now(),interval 12 month),1,1,850,1,'Starter Plan',
'Perfect for solo practitioners and small clinics just getting started.');
set @v = LAST_INSERT_ID();
insert into pricing_data_benefits(pricing_data_id,description,slot) values
(@v,'- 3 Month Plan: $850/month',0),
(@v,'- Features:',1),
(@v,'- Auto Scheduling - First Appointment',2),
(@v,'- Lower Marketing CoA, Higher ROI',3), 
(@v,'- Powerful, Targeted Advertising Co-Op',4),
(@v,'- Hassle-free Autopay Billing',5),
(@v,'- Renews Every 12 Months',6);

