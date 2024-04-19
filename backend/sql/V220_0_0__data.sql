
use pain;

set @f = 'Daul';
set @l = 'Raszy';
set @e = 'daulraszy@poundpain.com';

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    lower(@e),
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @f,
    @l,
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into user_entitlements(user_id,entitlements_id) values 
(@v,10),
(@v,13);

/* --- */

set @f = 'Raul';
set @l = 'Raszy';
set @e = 'raulraszy@poundpain.com';

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    lower(@e),
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @f,
    @l,
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into user_entitlements(user_id,entitlements_id) values 
(@v,12);

/* ----- */

set @f = 'Sebastian';
set @l = 'Ramirez';
set @e = 'ramirez@poundpain.com';

insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    lower(@e),
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @f,
    @l,
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into user_entitlements(user_id,entitlements_id) values 
(@v,10),
(@v,13);

/* ----- */
set @f = 'Don';
set @l = 'Moss';
set @e = 'don@poundpain.com';
insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    lower(@e),
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @f,
    @l,
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into user_entitlements(user_id,entitlements_id) values 
(@v,10),
(@v,13);

/* ----- */
set @f = 'Lamar';
set @l = 'Bolden';
set @e = 'lamar@poundpain.com';
insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    lower(@e),
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @f,
    @l,
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into user_entitlements(user_id,entitlements_id) values 
(@v,10),
(@v,13);

/* ----- */
set @f = 'Leroy';
set @l = 'Shaw';
set @e = 'leroy@poundpain.com';
insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    lower(@e),
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @f,
    @l,
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into user_entitlements(user_id,entitlements_id) values 
(@v,10),
(@v,13);

set @f = 'Teija';
set @l = 'Champ';
set @e = 'teija@poundpain.com';
insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    lower(@e),
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @f,
    @l,
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into user_entitlements(user_id,entitlements_id) values 
(@v,12);

set @f = 'Brittany';
set @l = 'Lir'; 
set @e = 'brittany@poundpain.com';
insert into users (email,password,first_name,last_name,phone_prefix,phone) values (
    lower(@e),
    '69EnsSs2Ejj1/mD5G2O8wt8vId9hmT8gQxrqx8bkly4=',
    @f,
    @l,
    '',
    ''
);

set @v = LAST_INSERT_ID();
insert into user_permissions(user_id,permissions_id) values 
(@v,1),
(@v,2),
(@v,3);

insert into user_entitlements(user_id,entitlements_id) values 
(@v,12);
