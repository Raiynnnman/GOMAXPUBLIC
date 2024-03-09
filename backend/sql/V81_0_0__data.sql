
use pain;
update salesforce_mapping set pain_field_name = 'initial_payment' 
    where sf_field_name='Payment Amount';

update salesforce_mapping set 
        pain_field_name = 'description',
        pain_join_col = 'pricing_data_id'
    where sf_field_name='Package Type';

