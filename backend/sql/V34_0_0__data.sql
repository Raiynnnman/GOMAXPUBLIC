
use pain;
select id into @v from users where email = 'pmaszy-legal@gmail.com';
insert into user_entitlements(user_id,entitlements_id) values 
(@v,4);
insert into user_products(user_id,products_id) values 
(@v,3);
insert into user_products(user_id,products_id) values 
(@v,6);
insert into user_permissions(user_id,permissions_id) values 
(@v,1);
insert into user_permissions(user_id,permissions_id) values 
(@v,2);
