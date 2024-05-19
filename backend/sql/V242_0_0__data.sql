
alter table client_intake add column (
    office_type_id int,
    FOREIGN KEY (office_type_id) REFERENCES office_type(id)
);
