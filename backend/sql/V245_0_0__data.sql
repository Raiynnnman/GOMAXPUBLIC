
use pain;

create table referrer_users_queue (
    id int primary key auto_increment,
    referrer_users_id int,
    office_id int,
    nextcheck DATETIME,
    accept_mail_sent int not null default 0,
    accept_text_sent int not null default 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
alter table referrer_users add column (nextcheck DATETIME);
alter table referrer_users add column (error_mail_sent int not null default 0);
alter table referrer_users add column (accept_mail_sent int not null default 0);
