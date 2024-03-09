
use pain;
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter) values
('Lead','PainID','provider_queue','id','');
alter table provider_queue drop column sf_lead_id;
alter table provider_queue add column (sf_id varchar(255) unique);
