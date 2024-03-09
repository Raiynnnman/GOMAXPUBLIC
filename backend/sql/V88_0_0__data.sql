
use pain;
alter table salesforce_mapping add column (include_in_update int not null default 1);
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Lead','Created Date','provider_queue','created','','office_id',0);
