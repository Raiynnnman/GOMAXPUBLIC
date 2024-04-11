
use pain;
delete from salesforce_mapping where sf_field_name = 'Invoice Paid';
insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Invoice Paid','invoices','invoice_status_id',' 
    and billing_period < 
            LAST_DAY(concat(year(now()),''-'',month(now()),''-'',day(now())))
    and billing_period > 
            concat(year(now()),''-'',month(now()),''-'',''01'')
    ',
    'office_id',1,0);
