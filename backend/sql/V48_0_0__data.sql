
use pain;
create table registrations_tokens(
    id int primary key auto_increment,
    registrations_id int,
    token varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registrations_id) REFERENCES registrations(id)
);
