
use pain;
drop table commission_users;
create table commission_users (
    id int primary key auto_increment,
    user_id int,
    commission_structure_id int,
    amount float,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (commission_structure_id) REFERENCES commission_structure(id)

);
