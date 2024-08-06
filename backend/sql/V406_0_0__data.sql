
use pain;
create table user_api_keys(
    id int primary key auto_increment,
    api_value varchar(64),
    user_id int,
    expires timestamp,
    active int not null default 1,
    created timestamp not null default current_timestamp,
    updated timestamp not null default current_timestamp on update CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
