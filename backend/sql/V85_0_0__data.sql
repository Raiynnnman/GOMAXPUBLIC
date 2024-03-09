
use pain;
update salesforce_mapping set 
    pain_table_name = 'office_addresses',
    pain_special_filter = 'order by id limit 1' where sf_field_name='Latitude';
update salesforce_mapping set 
    pain_table_name = 'office_addresses',
    pain_special_filter = 'order by id limit 1' where sf_field_name='Longitude';
