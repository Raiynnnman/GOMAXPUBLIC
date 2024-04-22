
use pain;
alter table office add column (is_pi_provider int not null default 0);
alter table provider_queue add column (lead_source varchar(255));
update provider_queue set lead_source = 'Import Spreadsheet' where office_id in (select id from office where active=0);
update provider_queue set lead_source = 'Import Stripe' where id in (select office_id from invoices); 

insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Lead Source','provider_queue','lead_source','','office_id',1,0),
('Lead','Is PI Provider','office','is_pi_provider','','office_id',1,0);
