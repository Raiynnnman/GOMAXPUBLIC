
use pain;
alter table office_addresses add column (sf_id varchar(64) unique);

insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col,include_in_update) values
('Account','Account ID','office_addresses','sf_id','','office_id',1),
('Account','Parent Account ID','office','sf_id','','',1),
('Account','Billing Street','office_addresses','addr1','','office_id',1),
('Account','Billing City','office_addresses','city','','office_id',1),
('Account','Billing State/Province','office_addresses','state','','office_id',1),
('Account','Billing Zip/Postal Code','office_addresses','zipcode','','office_id',1),
('Account','Billing Latitude','office_addresses','lat','','office_id',1),
('Account','Billing Longitude','office_addresses','lon','','office_id',1),
('Account','Website','provider_queue','website',' office_addresses.office_id ','office_id',1),
('Account','Subscription Plan','pricing_data','description',' office_plans.office_id ','office_id',1),
('Account','Last Modified Date','office_addresses','updated','','',0),
('Account','Owner ID','users','sf_id','','',1);
