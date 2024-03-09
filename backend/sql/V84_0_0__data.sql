
use pain;
update salesforce_mapping set 
    pain_special_filter = 'order by id limit 1' where sf_field_name='Created Date';
update salesforce_mapping set 
    pain_special_filter = 'order by id limit 1' where sf_field_name='State/Province';
update salesforce_mapping set 
    pain_special_filter = 'order by id limit 1' where sf_field_name='Zip/PostalCode';
