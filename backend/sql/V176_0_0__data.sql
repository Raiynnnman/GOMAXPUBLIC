
use pain;

insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Owner ID','office,users','commission_user_id',' and office.commission_user_id = users.id ','commission_user_id',1,1);

alter table provider_queue add column (sf_updated TIMESTAMP);
