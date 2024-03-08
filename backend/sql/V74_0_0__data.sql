
use pain;
create table salesforce_mapping (
    id int primary key auto_increment,
    sf_field_name varchar(255),
    sf_table_schema varchar(255),
    pain_field_name varchar(255),
    pain_table_name varchar(255),
    pain_special_filter varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

alter table provider_queue add column (sf_lead_id varchar(255) unique);

insert into salesforce_mapping (sf_table_schema,sf_field_name,pain_table_name,pain_field_name,pain_special_filter) values
('Lead','Lead ID','provider_queue','sf_lead_id',''),
('Lead','Last Name','users','last_name',''),
('Lead','First Name','users','first_name',''),
('Lead','Full Name','users','concat(first_name, " ", last_name)',''),
('Lead','Company','provider_queue','name',''),
('Lead','Street','office_addresses','concat(addr1, " ", addr2)',''),
('Lead','State/Province','office_addresses','state','order by created limit 1'),
('Lead','Zip/PostalCode','office_addresses','zipcode','order by created limit 1'),
('Lead','Latitude','office','lat',''),
('Lead','Longitude','office','lon',''),
('Lead','Email','users','email',''),
('Lead','Provider_type__c','office_type','name',''),
('Lead','Original_Subscription_Date__c','invoices','billing_period','order by created limit 1'),
('Lead','ConvertedDate','invoices','billing_period','order by created limit 1'),
('Lead','CreatedDate','provider_queue','created',''),
('Lead','PaymentTerm','office_plans','duration',''),
('Lead','PaymentAmount','provider_queue','duration',''),
('Lead','PackageType','pricing_data','name','');




