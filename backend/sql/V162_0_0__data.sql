
use pain;
delete from salesforce_mapping where sf_table_schema = 'Account' and sf_field_name = 'Account Type';
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Account','Account Type','office_type,office','name',' and office_type.id = office.office_type_id ','id',1);
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Account','Subscription Plan','pricing_data,office_plans','description',' and pricing_data.id = office_plans.pricing_data_id ','office_id',1);
