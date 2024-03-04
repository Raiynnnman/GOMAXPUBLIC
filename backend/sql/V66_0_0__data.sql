use pain;
drop table users_passwords;
create table user_passwords (
    user_id int,
    password varchar(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
