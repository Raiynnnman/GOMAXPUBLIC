
use pain;

create table setupIntents (
    id int primary key auto_increment,
    uuid varchar(128),
    stripe_key varchar(128)
);
