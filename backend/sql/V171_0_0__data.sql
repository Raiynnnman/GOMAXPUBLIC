
use pain;
delete from salesforce_mapping where sf_table_schema='Account' and sf_field_name='Owner ID';
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Account','Owner ID','office,users','commission_user_id',' and office.commission_user_id = users.id ','office_id',1,1);
