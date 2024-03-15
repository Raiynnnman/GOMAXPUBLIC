
use pain;
update pricing_data set duration=1 where description='$299/Month Annual Subscription Plan';                      
select id into @v from pricing_data where description='$299/Month Annual Subscription Plan';                      
update office_plans set end_date=start_date where pricing_data_id=@v;
