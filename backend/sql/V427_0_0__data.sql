

create table referrer_users_source (
    id int primary key auto_increment,
    name varchar(255)
);

insert into referrer_users_source (name) values 
('EMAIL_CAMPAIGN'),
('FACEBOOK'),
('INSTAGRAM'),
('4LegalLeads'),
('Martindale');
    
create table referrer_users_call_status (
    id int primary key auto_increment,
    name varchar(255)
);

insert into referrer_users_call_status(id,name) values 
(1,'1st Call'),
(10,'2nd Call'),
(20,'3rd Call'),
(30,'4th Call'),
(100,'1st Post Followup'),
(200,'2nd Post Followup');

create table referrer_users_accident_types(
    id int primary key auto_increment,
    name varchar(255)
);
insert into referrer_users_accident_types (id,name) values
(1,'Auto Accident');

create table referrer_users_vendor_status (
    id int primary key auto_increment,
    name varchar(255)
);
insert into referrer_users_vendor_status (id,name) values
(1,'ACCEPTED'),
(10,'REQUEST_REFUND_SPAM'),
(20,'REQUEST_REFUND_DISCONNECTED_PHONE'),
(30,'REQUEST_REFUND_INVALID_PHONE'),
(40,'REQUEST_REFUND_DENY_SUBMIT'),
(50,'REQUEST_REFUND_OUTSIDE_GEOGRAPHY'),
(60,'REQUEST_REFUND_OUTSIDE_PRACTICE_AREA'),
(70,'REQUEST_REFUND_DUPLICATE');

    
alter table referrer_users add column (
vendor_id varchar(255),
price_per_lead float not null default 0,
referrer_users_source_id int,
referrer_users_call_status_id int,
referrer_users_vendor_status_id int,
referrer_users_accident_types_id int,
FOREIGN KEY (referrer_users_source_id) REFERENCES referrer_users_source(id),
FOREIGN KEY (referrer_users_call_status_id) REFERENCES referrer_users_call_status(id),
FOREIGN KEY (referrer_users_accident_types_id) REFERENCES referrer_users_accident_types(id),
FOREIGN KEY (referrer_users_vendor_status_id) REFERENCES referrer_users_vendor_status(id)
);
