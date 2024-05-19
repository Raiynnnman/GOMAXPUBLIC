
use pain;

alter table referrer_users add column (doa date);
alter table referrer_users_queue add column (
    referrer_users_status_id int,
    response_date DATETIME,
    FOREIGN KEY (referrer_users_status_id) REFERENCES referrer_users_status(id)
);
