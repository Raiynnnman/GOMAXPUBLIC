
use pain;
insert into entitlements(id,name) values (14,'CRMUser');

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'pmaszy_crm@poundpain.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'PCRM',
    '',
    '',
    ''
);

set @v=LAST_INSERT_ID();
insert into user_entitlements(user_id,entitlements_id) values 
(@v,14);

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    'matt_crm@poundpain.com',
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    'MCRM',
    '',
    '',
    ''
);
set @v=LAST_INSERT_ID();
insert into user_entitlements(user_id,entitlements_id) values 
(@v,14);
