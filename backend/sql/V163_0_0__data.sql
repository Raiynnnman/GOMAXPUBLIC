
use pain;
delete from salesforce_mapping where sf_table_schema = 'Account' and sf_field_name = 'PainID';
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Account','PainID','office_addresses','id','','office_id',1);
