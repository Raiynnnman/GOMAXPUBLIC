
use pain;
alter table pricing_data add column (offset_days int not null default 0);
insert into pricing_data (price,locations,duration,start_date,end_date,active,trial,toshow,customers_required,upfront_cost,description,office_type_id,offset_days)
    values
(99,3,1,now(),date_add(now(),interval 12 MONTH),1,0,0,1,0,'#PAIN Associate Provider Fee',1,7);
