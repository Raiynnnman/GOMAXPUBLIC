
use pain;
drop table user_api_keys;
create table user_api_keys(
    id int primary key auto_increment,
    api_value varchar(255) unique,
    user_id int,
    expires timestamp,
    active int not null default 1,
    created timestamp not null default current_timestamp,
    updated timestamp not null default current_timestamp on update CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

insert into user_api_keys(user_id,api_value,expires) values (
    100,
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InBhdWxAcG91bmRwYWluLmNvbSIsInVzZXJfaWQiOjEwMH0.t_T4X1s3y6ovniXg-Dh_rCIV-Oi0fLT3jIm0ogYlThA',
    date_add(now(),interval 1 year)
);

insert into entitlements (id,name) values (16,'API');
insert into user_entitlements (user_id,entitlements_id) values (100,16);
