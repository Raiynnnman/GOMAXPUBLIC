
insert into office (name) values ('MARTINDALE');
set @v = LAST_INSERT_ID();
update referrer_users set referrer_id=@v;
