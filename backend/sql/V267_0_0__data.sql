
use pain;
alter table referrer_users add column (
    office_addresses_id int,
    FOREIGN KEY (office_addresses_id) REFERENCES office_addresses(id)
);
