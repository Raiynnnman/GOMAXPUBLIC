
use pain;


create table if not exists salesforce_last_update (
    sf_table_schema varchar(255) unique,
    last_check timestamp
);

    
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Subscription Plan','pricing_data,office_plans','description',' and pricing_data.id = office_plans.pricing_data_id ','office_id',1,1);
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Lead','Status','provider_queue', 'provider_queue_status_id','','office_id',1);
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Lead','Payment Amount','provider_queue', 'initial_payment','','office_id',1);
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Lead','Sales URL','provider_queue','id','','office_id',0);
