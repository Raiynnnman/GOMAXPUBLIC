
use pain;

alter table pricing_data add column (
    office_type_id int,
    FOREIGN KEY (office_type_id) REFERENCES office_type(id)
);

update pricing_data set office_type_id=1;
    
insert into pricing_data (price,locations,duration,start_date,end_date,active,trial,toshow,customers_required,upfront_cost,description,office_type_id)
    values
(0,3,12,now(),date_add(now(),interval 12 MONTH),0,1,0,0,0,'#PAIN Legal Subscription',2);
