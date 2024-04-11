
delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='Email';
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_back_sync,include_in_update) values
('Lead','Email','office','email','','office_id',1,1);
