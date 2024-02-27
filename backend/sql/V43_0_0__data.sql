
use pain;

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'christi@poundpain.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Christi',
    'Robinson',
    '',
    ''
);
set @v = LAST_INSERT_ID()

insert into user_entitlements(user_id,entitlements_id) values 
(@v,1);

insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'alissa@poundpain.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Alissa',
    'Davis',
    '',
    ''
);
set @v = LAST_INSERT_ID()

insert into user_entitlements(user_id,entitlements_id) values 
(@v,1);

insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'tawala@poundpain.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Tawala',
    'Brumfield',
    '',
    ''
);
set @v = LAST_INSERT_ID()

insert into user_entitlements(user_id,entitlements_id) values 
(@v,1);

insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'drpappas@poundpain.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'George',
    'Pappas',
    '',
    ''
);
set @v = LAST_INSERT_ID()

insert into user_entitlements(user_id,entitlements_id) values 
(@v,1);

insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'win@poundpain.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Winston',
    'Burse',
    '',
    ''
);
set @v = LAST_INSERT_ID()

insert into user_entitlements(user_id,entitlements_id) values 
(@v,1);

insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);
