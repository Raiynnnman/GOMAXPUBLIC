
use pain;
update pricing_data set upfront_cost = -1 where office_type_id = 2 and description='Growth Plan';
update pricing_data set upfront_cost = -1 where office_type_id = 2 and description='Starter Plan';
update pricing_data set upfront_cost = -1 where office_type_id = 2 and description='Professional Plan';
