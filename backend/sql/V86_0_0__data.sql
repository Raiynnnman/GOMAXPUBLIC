
use pain;
update salesforce_mapping set 
    pain_field_name = 'datediff(end_date,start_date)'
    where sf_field_name='Payment Term';
