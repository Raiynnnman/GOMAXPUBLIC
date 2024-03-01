
use pain;
alter table office add column (
    user_id int,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
