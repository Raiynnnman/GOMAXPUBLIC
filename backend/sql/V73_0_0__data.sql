
use pain;
alter table registrations add column (
    user_id int,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
