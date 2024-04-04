
use pain;
delete from salesforce_mapping where sf_table_schema = 'Account' and sf_field_name = 'Type';
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Account','Account Type','office_type,office','name',' and office_type.id = office.office_type_id ','office_id',1);
