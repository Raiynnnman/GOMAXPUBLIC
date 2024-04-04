
use pain;
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Account','Phone','office_addresses','phone','','office_id',1),
('Account','Type','office_type,office','name',' and office_type.id = office.office_type_id ','office_id',1),
('Account','Account Name','office_addresses','name','','office_id',1);
