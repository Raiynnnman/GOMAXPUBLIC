
use pain;
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Account','Owner ID','users,office','commission_user_id','','user_id',1,1);
