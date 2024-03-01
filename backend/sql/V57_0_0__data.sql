
use pain;
create table invoices_comment (
    id int primary key auto_increment,
    invoices_id int,
    user_id int,
    text mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoices_id) REFERENCES invoices(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
alter table invoices_comment add column (uuid varchar(255) unique);
