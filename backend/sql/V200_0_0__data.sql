
use pain;
delete from salesforce_mapping where sf_field_name = 'Invoice Paid';
delete from salesforce_mapping where sf_field_name = 'Ready To Buy';
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Invoice Paid','invoices,office_plans','invoice_status_id=15',' 
    and invoices.office_id = office_plans.office_id and 
    year(billing_period) = year(office_plans.start_date) and
    month(billing_period) = month(office_plans.start_date) 
    ',
    'office_id',1,0);
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Ready To Buy','invoices,office_plans','invoice_status_id=15',' 
    and invoices.office_id = office_plans.office_id and 
    year(billing_period) = year(office_plans.start_date) and
    month(billing_period) = month(office_plans.start_date) 
    ',
    'office_id',1,0);
