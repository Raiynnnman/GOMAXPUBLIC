
use pain;

alter table invoices add column (
    office_plans_id int,
    FOREIGN KEY (office_plans_id) REFERENCES office_plans(id)
);
