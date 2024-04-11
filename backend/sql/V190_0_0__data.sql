
use pain;
update salesforce_mapping set include_in_back_sync=0 where sf_table_schema='Lead' and sf_field_name='Sales URL';
update salesforce_mapping set include_in_back_sync=0 where sf_table_schema='Lead' and sf_field_name='Status';
update salesforce_mapping set include_in_back_sync=0 where sf_table_schema='Lead' and sf_field_name='Subscription Plan';
