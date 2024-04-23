
use pain;
create table office_comment (
    id int primary key auto_increment,
    office_id int,
    user_id int,
    text mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
alter table office_comment add column (uuid varchar(255) unique);
