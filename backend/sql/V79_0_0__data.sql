
drop table salesforce_mapping;
create table if not exists salesforce_mapping (
    id int primary key auto_increment,
    sf_field_name varchar(255),
    sf_table_schema varchar(255),
    pain_field_name varchar(255),
    pain_table_name varchar(255),
    pain_special_filter varchar(255),
    pain_join_col varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter,pain_join_col) values
('Lead','Lead ID','provider_queue','sf_lead_id','','office_id'),
('Lead','Last Name','users','last_name','','user_id'),
('Lead','First Name','users','first_name','','user_id'),
('Lead','Full Name','users','concat(first_name, " ", last_name)','','user_id'),
('Lead','Company','provider_queue','name','','office_id'),
('Lead','Street','office_addresses','concat(addr1, " ", addr2)','','office_id'),
('Lead','State/Province','office_addresses','state','order by created limit 1','office_id'),
('Lead','Zip/PostalCode','office_addresses','zipcode','order by created limit 1','office_id'),
('Lead','Latitude','office','lat','','office_id'),
('Lead','Longitude','office','lon','','office_id'),
('Lead','Email','users','email','','user_id'),
('Lead','Provider Type','office_type','name','','office_id'),
('Lead','Original Subscription Date','invoices','billing_period','order by created limit 1','office_id'),
('Lead','Converted Date','invoices','billing_period','order by created limit 1','office_id'),
('Lead','Created Date','provider_queue','created','','office_id'),
('Lead','Payment Term','office_plans','duration','','office_id'),
('Lead','Payment Amount','provider_queue','duration','','office_id'),
('Lead','PainID','provider_queue','id','','office_id'),
('Lead','Package Type','pricing_data','name','','office_id');
