
use pain;
update office_plans 
    set end_date=date_add(start_date,INTERVAL 2 YEAR) where 
    pricing_data_id in (select id from pricing_data where duration = 1);

update pricing_data set duration=12 where description='$299/Month Annual Subscription Plan';                      
select id into @v from pricing_data where description='$299/Month Annual Subscription Plan';                      
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;


select id into @v from pricing_data where description='Unlimited Locations';
update pricing_data set duration=12 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;

select id into @v from pricing_data where description='$333/Month Annual Subscription Plan'; 
update pricing_data set duration=12 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;

select id into @v from pricing_data where description='$999 3-Month Introductory Plan';                     
update pricing_data set duration=3 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 3 month) where pricing_data_id=@v;

select id into @v from pricing_data where description='$499/Month Monthly Plan';
update pricing_data set duration=12 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;

select id into @v from pricing_data where description='$399/Month 6-Month Subscription Plan';                     
update pricing_data set duration=6 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 6 month) where pricing_data_id=@v;

select id into @v from pricing_data where description='$399/Month Annual Subscription Plan';                      
update pricing_data set duration=1 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;

select id into @v from pricing_data where description='6 month Subscription Plan';                                
update pricing_data set duration=1 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 6 month) where pricing_data_id=@v;

select id into @v from pricing_data where description='$499/Month 6 Month Subscription Plan';                     
update pricing_data set duration=1 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 6 month) where pricing_data_id=@v;

select id into @v from pricing_data where description='PoundPain.com Subscription, Monthly, Unlimited Locations'; 
update pricing_data set duration=12 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;

select id into @v from pricing_data where description='Master - Monthly Subscription x';                          
update pricing_data set duration=12 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;

select id into @v from pricing_data where description='Initial 2 Months';                                         
update pricing_data set duration=2 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 2 month) where pricing_data_id=@v;

select id into @v from pricing_data where description='Master - Monthly Subscription';                            
update pricing_data set duration=12 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;

select id into @v from pricing_data where description='delete PoundPain.com Inital Subscription';                 
update pricing_data set duration=12 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;

select id into @v from pricing_data where description='Paid Trial';                                               
update pricing_data set duration=12 where id=@v;
update office_plans set end_date=date_add(start_date,INTERVAL 1 year) where pricing_data_id=@v;
