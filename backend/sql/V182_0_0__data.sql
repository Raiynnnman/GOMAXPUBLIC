
use pain;
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Lead','Website','provider_queue,office_addresses','website',' and provider_queue.office_id = office_addresses.office_id ','office_id',1);
