
use pain;
delete from pricing_data where office_type_id = 2;
insert into pricing_data(
price,duration,slot,toshow,start_date,end_date,active,customers_required,upfront_cost,office_type_id,description,plan_summary
)
values
(-1,12,0,1,now(),date_add(now(),interval 12 month),1,1,500,2,'Professional Plan',
'Designed for established practices seeking comprehensive support.');
set @v = LAST_INSERT_ID();
insert into pricing_data_benefits(pricing_data_id,description,slot) values
(@v,'12 Month Plan: Contact Us!',0),
(@v,'Features:',1),
(@v,'Auto Scheduling First Appointment',2),
(@v,'Lower Marketing CoA, Higher ROI',3), 
(@v,'Powerful, Targeted Advertising Co-Op',4),
(@v,'Renews Every 12 Months',6);


insert into pricing_data(price,duration,slot,toshow,start_date,end_date,active,customers_required,upfront_cost,office_type_id,description,plan_summary)
values
(-1,6,1,1,now(),date_add(now(),interval 12 month),1,1,700,2,'Growth Plan',
'Ideal for growing practices looking to expand their patient base.');
set @v = LAST_INSERT_ID();
insert into pricing_data_benefits(pricing_data_id,description,slot) values
(@v,'6 Month Plan: Contact Us!',0),
(@v,'Features:',1),
(@v,'Auto Scheduling First Appointment',2),
(@v,'Lower Marketing CoA, Higher ROI',3), 
(@v,'Powerful, Targeted Advertising Co-Op',4),
(@v,'Renews Every 12 Months',6);



insert into pricing_data(price,duration,slot,toshow,start_date,end_date,active,customers_required,upfront_cost,office_type_id,description,plan_summary)
values
(-1,3,2,1,now(),date_add(now(),interval 12 month),1,1,850,2,'Starter Plan',
'Perfect for solo practitioners and small clinics just getting started.');
set @v = LAST_INSERT_ID();
insert into pricing_data_benefits(pricing_data_id,description,slot) values
(@v,'3 Month Plan: Contact Us!',0),
(@v,'Features:',1),
(@v,'Auto Scheduling First Appointment',2),
(@v,'Lower Marketing CoA, Higher ROI',3), 
(@v,'Powerful, Targeted Advertising Co-Op',4),
(@v,'Renews Every 12 Months',6);
