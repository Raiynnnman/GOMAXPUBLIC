
use pain;

create table performance(
    classname varchar(255),
    user_id int,
    request mediumtext,
    ms int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
