
use pain;
insert into entitlements (id,name) values (9,'Referrer');

select id into @v from office where name = 'Daul Maszy Referrer';
select id into @t from users where email = 'pmaszy_ref@gmail.com';

delete from user_entitlements where user_id = @t;
insert into user_entitlements (user_id,entitlements_id) values 
    (@v,7),(@v,8);
