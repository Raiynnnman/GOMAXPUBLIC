
use pain;
alter table referrer_users add column (
    client_intake_id int,
    FOREIGN KEY (client_intake_id) REFERENCES client_intake(id)
);
