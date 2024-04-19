
use pain;

insert into entitlements(id,name) values (12,'BusinessDevelopmentRepresentative');
insert into entitlements(id,name) values (13,'AccountExecutive');

alter table office add column (
    bdr_user_id int,
    FOREIGN KEY (bdr_user_id) REFERENCES users(id)
);

create table commission_bdr_structure (
    id int primary key auto_increment,
    pricing_data_id int,
    on_appt float,
    on_sale float,
    start_date date,
    end_date date,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

alter table commission_users add column (description varchar(255));

create table commission_bdr_users (
    id int primary key auto_increment,
    user_id int,
    description varchar(255),
    commission_bdr_structure_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (commission_bdr_structure_id) REFERENCES commission_bdr_structure(id)
);

select id into @t from pricing_data where description='#PAIN Annual Subscription';
insert into commission_bdr_structure (pricing_data_id,on_appt,on_sale,start_date,end_date) values 
    (@t,20,10,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN 6 Month Subscription';
insert into commission_bdr_structure (pricing_data_id,on_appt,on_sale,start_date,end_date) values 
    (@t,20,10,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN 3 Month Subscription' limit 1;
insert into commission_bdr_structure (pricing_data_id,on_appt,on_sale,start_date,end_date) values 
    (@t,20,10,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN Introductory 3 Month Subscription';
insert into commission_bdr_structure (pricing_data_id,on_appt,on_sale,start_date,end_date) values 
    (@t,0,0,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN Introductory Setup';
insert into commission_bdr_structure (pricing_data_id,on_appt,on_sale,start_date,end_date) values 
    (@t,0,0,now(),date_add(now(),interval 12 month));

select id into @t from pricing_data where description='#PAIN In-Network';
insert into commission_bdr_structure (pricing_data_id,on_appt,on_sale,start_date,end_date) values 
    (@t,0,0,now(),date_add(now(),interval 12 month));

