
use pain;
alter table client_intake_offices add column (
    office_addresses_id int,
    FOREIGN KEY (office_addresses_id) REFERENCES office_addresses(id)
);
