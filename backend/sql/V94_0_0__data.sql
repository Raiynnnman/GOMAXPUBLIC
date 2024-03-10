
use pain;
alter table salesforce_mapping add column (include_in_back_sync int not null default 1);

update salesforce_mapping set include_in_back_sync = 0 where sf_field_name='Converted Date';
update salesforce_mapping set include_in_back_sync = 0 where sf_field_name='Created Date';
update salesforce_mapping set include_in_back_sync = 0 where sf_field_name='Package Type';
update salesforce_mapping set include_in_back_sync = 0 where sf_field_name='PainID';
update salesforce_mapping set include_in_back_sync = 0 where sf_field_name='Payment Term';
update salesforce_mapping set include_in_back_sync = 0 where sf_field_name='Payment Amount';
update salesforce_mapping set include_in_back_sync = 0 where sf_field_name='Original Subscription Date';
update salesforce_mapping set include_in_back_sync = 0 where sf_field_name='Lead ID';
