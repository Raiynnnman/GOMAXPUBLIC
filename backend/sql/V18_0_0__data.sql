
use pain;

create table users (
    id int primary key auto_increment,
    password varchar(255),
    email varchar(255),
    first_name varchar(255),
    last_name varchar(255),
    locked int not null default 0,
    active int not null default 1,
    timezone_id int not null default 1,
    phone_prefix varchar(255),
    phone varchar(255),
    last_login TIMESTAMP,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

insert into users (email,id,first_name,last_name,phone_prefix,phone) values (
    'System',
    1,
    'System',
    '',
    '',
    ''
);

insert into users (email,id,password,first_name,last_name,phone_prefix,phone) values (
    'paul@poundpain.com',
    100,
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Paul',
    'Maszy',
    '+1',
    '8326938998'
);
insert into users (email,id,password,first_name,last_name,phone_prefix,phone) values (
    'rain@poundpain.com',
    101,
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Rain',
    'Rain',
    '',
    ''
);

insert into users (email,id,password,first_name,last_name,phone_prefix,phone) values (
    'amanda@poundpain.com',
    102,
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Amanda',
    'Ortiz',
    '',
    ''
);

create table entitlements (
    id int primary key auto_increment,
    name varchar(255)
);

insert into entitlements (id,name) values 
( 1,"Admin"),
( 2,"Customer"),
( 3,"Provider"),
( 4,"Legal"),
( 5,"Tow");

create table permissions (
    id int primary key auto_increment,
    name varchar(255)
);
insert into permissions(id,name) values 
( 1,"Admin"),
( 2,"Write"),
( 3,"Read");


create table user_entitlements (
    user_id int,
    entitlements_id int,
    FOREIGN KEY (entitlements_id) REFERENCES entitlements (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into user_entitlements(user_id,entitlements_id) values 
(100,1),
(101,1),
(102,1);

create table user_permissions (
    id int primary key auto_increment,
    user_id int,
    permissions_id int,
    FOREIGN KEY (permissions_id) REFERENCES permissions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into user_permissions(user_id,permissions_id) values 
(100,1),
(100,2),
(100,3),
(101,1),
(101,2),
(101,3),
(102,1),
(102,2),
(102,3);

create table company(
    id int primary key auto_increment,
    company_id int unique,
    name varchar(255)
);

insert into company (company_id,name) values (100,"#PAIN");
insert into company (company_id,name) values (101,"General");

create table audit_list (
    id int primary key auto_increment,
    user_id int not null default 0,
    company_id int,
    success int not null default 0,
    message varchar(255),
    metadata varchar(255),
    FOREIGN KEY (company_id) REFERENCES company(company_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

alter table users add column (company_id int);
update users set company_id=100;

create table office (
    id int primary key auto_increment,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name varchar(255),
    dhd_id varchar(255) unique,
    active int not null default 1,
    stripe_connect_id varchar(64)
);

insert into office (id,name,dhd_id) values (1,'ACME Medical','ddddddddddddd');
insert into office (id,name,dhd_id) values (2,'Fun Medical','edddddddddddd');

create table office_addresses (
    id int primary key auto_increment,
    office_id int,
    addr1 varchar(255),
    addr2 varchar(255),
    phone varchar(24),
    city varchar(255),
    state varchar(255),
    zipcode varchar(15),
    FOREIGN KEY (office_id) REFERENCES office(id)
);

insert into office_addresses (
    office_id,addr1,addr2,phone,city,state,zipcode
) values 
( 1,'11214 My Office Lane','','333-222-1111','Houston','TX','77089'),
( 2,'1 Dr Lane','','333-223-1111','Pearland','TX','77089');


alter table users add column (title varchar(255));
insert into users (email,id,first_name,last_name,title) values
    ('adoctor01@poundpain.com',105,'Michael','McGidden','Doctor');
insert into users (email,id,first_name,last_name,title) values
    ('adoctor04@poundpain.com',106,'Ginger','Wales','Doctor');

create table office_user (
    office_id int,
    user_id int,
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into office_user (office_id,user_id) values 
    ( 1, 105 ),
    ( 2, 106 );

drop table audit_list;
create table audit_list (
    id int primary key auto_increment,
    user_id int not null default 0,
    office_id int,
    success int not null default 0,
    message varchar(255),
    metadata varchar(255),
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

create table context (
    user_id int,
    office_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

create table ratings (
    id int primary key auto_increment,
    user_id int,
    rating float,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into ratings (user_id,rating) values (105,4.5);
insert into ratings (user_id,rating) values (106,3.5);

alter table office_addresses add column(lat float not null default 0,lon float not null default 0);

update office_addresses set lon=-95.2371096,lat=29.5816708 where id=1;
update office_addresses set lon=-95.2374041,lat=29.5802625 where id=2;

create table physician_media (
    id int primary key auto_increment,
    user_id int,
    headshot varchar(512),
    video varchar(512),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into physician_media(user_id) values 
(105),
(106);

update users set title = 'Dr.' where title='Doctor';

create table physician_schedule (
    id int primary key auto_increment,
    user_id int,
    day DATE,
    time varchar(255)
);

create table physician_schedule_scheduled (
    id int primary key auto_increment,
    physician_schedule_id int
);

insert into physician_schedule (user_id,day,time) values 
(105,'2023-05-04','3:45'),
(105,'2023-05-04','4:15'),
(105,'2023-05-04','5:30'),
(106,'2023-05-04','5:30'),
(106,'2023-05-04','5:30'),
(106,'2023-05-04','5:30');

create table physician_about (
    id int primary key auto_increment,
    user_id int,
    text varchar(512),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


insert into physician_about (user_id,text) values (101,'Caring and patient doctor description');
insert into physician_about (user_id,text) values (106,'Studying medicine for 20 years, good with kids');
update users set password='69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=' where id=105;
update users set password='69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=' where id=106;
create table physician_schedule_config (
    id int primary key auto_increment,
    user_id int,
    start_time varchar(25),
    end_time varchar(25),
    inter int,
    recurring int not null default 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into physician_schedule_config (user_id,start_time,end_time,inter,recurring) values
(105,'8:30','11:30',30,1),
(105,'13:00','16:30',30,1),
(106,'8:30','11:30',30,1),
(106,'13:00','16:30',30,1);

delete from physician_schedule_config;
alter table physician_schedule_config add column (days varchar(255));
insert into physician_schedule_config (user_id,start_time,end_time,inter,recurring,days) values
(105,'8:30','11:30',30,1,'[0,1,2,3,4,5]'),
(105,'13:00','16:30',30,1,'[0,1,2,3,4]'),
(106,'8:30','11:30',30,1,'[0,1,2,3,4,5]'),
(106,'13:00','16:30',30,1,'[0,1,2,3,4]');
alter table physician_schedule_config add column (tstamp DATETIME);
alter table physician_schedule add column (tstamp DATETIME);
alter table physician_schedule_config drop column tstamp;
alter table physician_schedule add column (active int not null default 1);
create table appt_status (
    id int primary key auto_increment,
    name varchar(255)
);

insert into appt_status (id,name) values
(1,'RESERVED'),
(10,'PAYMENT_PROCESSING'),
(20,'INITIAL_CALL'),
(30,'APPOINTMENT_SCHEDULED'),
(40,'APPOINTMENT_STARTED'),
(50,'APPOINTMENT_COMPLETED'),
(100,'PAYMENT_FAILED'),
(101,'APPOINTMENT_CANCELLED');

alter table physician_schedule_scheduled add column (
    appt_status_id int,
    FOREIGN KEY (appt_status_id) REFERENCES appt_status(id)
);
alter table physician_schedule_scheduled add column (
    user_id int not null default 1,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

create table login_tokens (
    id int primary key auto_increment,
    user_id int,
    token varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
insert into appt_status (id,name) values (2,'REGISTERED');
create table users_passwords (
    user_id int,
    password varchar(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

drop table login_tokens;
create table user_login_tokens (
    id int primary key auto_increment,
    user_id int,
    token varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
create table visits (
    id int primary key auto_increment,
    procedures_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

insert into user_entitlements(user_id,entitlements_id) values
(105,3),
(106,3);

create table appt_comments (
    id int primary key auto_increment,
    text mediumtext,
    physician_schedule_scheduled_id int,
    user_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (physician_schedule_scheduled_id) REFERENCES physician_schedule_scheduled(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_physician_schedule_id ON physician_schedule_scheduled(physician_schedule_id);
drop table if exists appt_comments;
create table appt_comments (
    id int primary key auto_increment,
    text mediumtext,
    physician_schedule_scheduled_id int,
    user_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (physician_schedule_scheduled_id) REFERENCES physician_schedule_scheduled(physician_schedule_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into office (name) values ('Direct Anesthesiology');
set @v = LAST_INSERT_ID();
insert into office_addresses (office_id,addr1,addr2,city,state,zipcode) values 
    (@v,'1853 Pearland Pkwy','Ste 117', 'Pearland', 'TX', 77581);
insert into office_user (office_id,user_id) values (@v,102);

insert into office (name) values ('Best Value Anesthesiology');
set @v = LAST_INSERT_ID();
insert into office_addresses (office_id,addr1,addr2,city,state,zipcode) values 
(@v,'2550 Pearland Pkway','', 'Pearland', 'TX', 77581);
insert into office_user (office_id,user_id) values (@v,105);

alter table office add column (
    ein_number varchar(255),
    accepted_tos int not null default 0
);
update office set ein_number='12-12345';
insert into entitlements (id,name) values 
( 7, "OfficeAdmin" ),
( 8, "CorporateAdmin" );
create table legal (
    id int primary key auto_increment,
    user_id int,
    active int not null default 1,
    addr1 varchar(255),
    addr2 varchar(255),
    phone varchar(24),
    city varchar(255),
    state varchar(255),
    zipcode varchar(15),
    lat float,
    lon float,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'pmaszy@gmail.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Paul',
    'Maszy',
    '+1',
    '8326938998'
);

set @v = LAST_INSERT_ID();

insert into legal (user_id,addr1,phone,city,state,zipcode) values 
(@v,'11518 Cecil Summers Way','+18326938998','Houston','TX','77089');

insert into user_entitlements(user_id,entitlements_id) values 
(@v,4);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'pmaszy-cust@gmail.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Paul',
    'Maszy',
    '+1',
    '8326938998'
);


set @v = LAST_INSERT_ID();
insert into user_entitlements(user_id,entitlements_id) values 
(@v,2);

create table legal_schedule (
    id int primary key auto_increment,
    user_id int,
    day DATE,
    time varchar(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


create table legal_schedule_scheduled (
    id int primary key auto_increment,
    legal_schedule_id int,
    FOREIGN KEY (legal_schedule_id) REFERENCES legal_schedule(id)
);

create table legal_schedule_config (
    id int primary key auto_increment,
    user_id int,
    start_time varchar(25),
    end_time varchar(25),
    inter int,
    recurring int not null default 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into legal_schedule_config (user_id,start_time,end_time,inter,recurring) values
(@v,'8:30','11:30',30,1),
(@v,'13:00','16:30',30,1);

create table products (
    id int primary key auto_increment,
    name varchar(255) unique
);

insert into products (id,name) values
(1,'Clients'),
(2,'Customer'),
(3,'Legal'),
(4,'Search'),
(5,'System'),
(6,'Settings');

create table user_products (
    id int primary key auto_increment,
    user_id int,
    products_id int,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (products_id) REFERENCES products(id)
);
alter table legal_schedule_config add column (days varchar(255));
delete from legal_schedule_config;
set @v = (select id from users where email = 'pmaszy@gmail.com');
insert into physician_schedule_config (user_id,start_time,end_time,inter,recurring,days) values
(@v,'8:30','11:30',30,1,'[0,1,2,3,4,5]'),
(@v,'13:00','16:30',30,1,'[0,1,2,3,4]');
set @v = (select id from users where email = 'pmaszy@gmail.com');
insert into legal_schedule_config (user_id,start_time,end_time,inter,recurring,days) values
(@v,'8:30','11:30',30,1,'[0,1,2,3,4,5]'),
(@v,'13:00','16:30',30,1,'[0,1,2,3,4]');
alter table legal_schedule add column (tstamp datetime);
alter table legal_schedule add column (active int not null default 1);
alter table legal add column (accepted_tos int not null default 0);
update legal set zipcode=77089,city='Houston',state='TX';
alter table legal_schedule_scheduled add column (
    user_id int,
    physician_schedule_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (physician_schedule_id) REFERENCES physician_schedule(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
create table legal_schedule_failures (
    id int primary key auto_increment,
    physician_schedule_id int,
    user_id int,
    legal_unavailable int not null default 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (physician_schedule_id) REFERENCES physician_schedule(id)
);
update appt_status set name='INITIAL_CALL' where id=10;
update appt_status set name='APPOINTMENT_SCHEDULED' where id=20;
update appt_status set name='PAYMENT_PROCESSING' where id=30;
insert into appt_status (id,name) values (31,'PAYMENT_SUCCESS');
insert into appt_status (id,name) values (32,'PAYMENT_FAILED');
rename table appt_comments to physician_appt_comments;
create table legal_appt_comments (
    id int primary key auto_increment,
    text mediumtext,
    legal_schedule_scheduled_id int,
    user_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (legal_schedule_scheduled_id) REFERENCES legal_schedule_scheduled(legal_schedule_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
