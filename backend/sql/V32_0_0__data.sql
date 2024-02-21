
use pain;

drop table if exists legal_appt_comments;
drop table if exists legal_schedule_scheduled;
drop table if exists legal_schedule_failures;
drop table if exists legal_schedule_config;
drop table if exists legal_schedule;
drop table if exists legal;

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'pmaszy-legal@gmail.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Paul',
    'Maszy',
    '+1',
    '8326938998'
);
set @v = LAST_INSERT_ID();
insert into office (name) values ('ACME Legal');
set @t = LAST_INSERT_ID();
insert into office_user (office_id,user_id) values 
    ( @t, @v);
insert into office_addresses (
    office_id,addr1,addr2,phone,city,state,zipcode
) values 
( @t,'11214 A Legal Office','','333-222-1111','Houston','TX','77089'),
( @t,'12 Baxster blvd','','333-222-1111','Houston','TX','77021');
