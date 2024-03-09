
use pain;

insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Lead','LastModifiedDate','provider_queue','updated','','office_id',0);

delete from salesforce_mapping where sf_field_name = 'Updated';
