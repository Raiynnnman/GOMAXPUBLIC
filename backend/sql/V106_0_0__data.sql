
insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'daphne@poundpain.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'Daphne',
    'Schaarman',
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_entitlements(user_id,entitlements_id) values 
(@v,1);

insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);
