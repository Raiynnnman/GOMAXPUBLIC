
alter table support_queue add column (
    contact_user_id int,
    FOREIGN KEY (contact_user_id) REFERENCES users(id)
);
