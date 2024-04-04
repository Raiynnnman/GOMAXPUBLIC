
use pain;

alter table commission_users add column (
    office_id int,
    FOREIGN KEY (office_id) REFERENCES office(id)
);

insert into entitlements (id,name) values (11,'CommissionsAdmin');

select id into @v from users where  email='rain@poundpain.com';
insert into user_entitlements(user_id,entitlements_id) values (@v,11);

select id into @v from users where  email='paul@poundpain.com';
insert into user_entitlements(user_id,entitlements_id) values (@v,11);

select id into @v from users where  email='christi@poundpain.com';
insert into user_entitlements(user_id,entitlements_id) values (@v,11);
