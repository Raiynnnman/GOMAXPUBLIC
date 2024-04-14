
use pain;
delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='Street';
insert into salesforce_mapping (
    sf_table_schema,sf_field_name,pain_table_name,pain_field_name,
    pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Street','office_addresses','addr1',' ','oa_id',1,1);

delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='Phone';
insert into salesforce_mapping (
    sf_table_schema,sf_field_name,pain_table_name,pain_field_name,
    pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Phone','office_addresses','phone',' ','oa_id',1,1);

delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='City';
insert into salesforce_mapping (
    sf_table_schema,sf_field_name,pain_table_name,pain_field_name,
    pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','City','office_addresses','city',' ','oa_id',1,1);

delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='Zip/Postal Code';
delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='Zip/PostalCode';
insert into salesforce_mapping (
    sf_table_schema,sf_field_name,pain_table_name,pain_field_name,
    pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Zip/Postal Code','office_addresses','zipcode',' ','oa_id',1,1);

delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='State/Province';
insert into salesforce_mapping (
    sf_table_schema,sf_field_name,pain_table_name,pain_field_name,
    pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','State/Province','office_addresses','state',' ','oa_id',1,1);

delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='Latitude';
insert into salesforce_mapping (
    sf_table_schema,sf_field_name,pain_table_name,pain_field_name,
    pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Latitude','office_addresses','lat',' ','oa_id',1,1);

delete from salesforce_mapping where sf_table_schema='Lead' and sf_field_name='Longitude';
insert into salesforce_mapping (
    sf_table_schema,sf_field_name,pain_table_name,pain_field_name,
    pain_special_filter,pain_join_col,include_in_update,include_in_back_sync) values
('Lead','Longitude','office_addresses','lon','','oa_id',1,1);

