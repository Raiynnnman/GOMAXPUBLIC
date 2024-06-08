
use pain;
alter table pricing_data add column (placeholder int not null default 0);
insert into pricing_data(
price,duration,slot,toshow,start_date,end_date,active,customers_required,upfront_cost,office_type_id,description,plan_summary,placeholder
) values
(0,12,0,1,now(),date_add(now(),interval 12 month),1,1,0,1,'PLACEHOLDER_NO_BILLING','PLACEHOLDER_NO_BILLING',1);
