
use pain;
update salesforce_mapping set pain_join_col='oa_id' where sf_table_schema='Account' and pain_table_name='office_addresses';
update salesforce_mapping set pain_join_col='oa_id' where sf_table_schema='Account' and pain_table_name='provider_queue,office_addresses';
