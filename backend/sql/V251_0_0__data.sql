
use pain;
create table referrer_users_lock(
    id int primary key auto_increment,
    referrer_users_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_users_id) REFERENCES referrer_users(id)
);
