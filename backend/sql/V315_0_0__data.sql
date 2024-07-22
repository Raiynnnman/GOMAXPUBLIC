
use pain;
insert into entitlements(id,name) values (15,'InvestorView');
insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'pmaszy-investor@gmail.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Paul',
    'Maszy',
    '+1',
    '8326938998'
);
set @v = LAST_INSERT_ID();

insert into user_entitlements(user_id,entitlements_id) values (@v,15);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'rain-investor@gmail.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Paul',
    'Maszy',
    '+1',
    '8326938998'
);
set @v = LAST_INSERT_ID();
insert into user_entitlements(user_id,entitlements_id) values (@v,15);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'anthonyc-investor@gmail.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Paul',
    'Maszy',
    '+1',
    '8326938998'
);
set @v = LAST_INSERT_ID();
insert into user_entitlements(user_id,entitlements_id) values (@v,15);
