
use pain;
alter table office add column (
    setter_user_id int,
    FOREIGN KEY (commission_user_id) REFERENCES users(id)
);
