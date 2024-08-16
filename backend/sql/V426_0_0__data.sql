
create table referrer_users_history (
    id int primary key auto_increment,
    user_id int,
    referrer_users_id int,
    text varchar(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (referrer_users_id) REFERENCES referrer_users(id)
);

create table referrer_users_comment (
    id int primary key auto_increment,
    user_id int,
    referrer_users_id int,
    text mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_users_id) REFERENCES referrer_users(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
