
use pain;
alter table office add column (
    billing_system_id int,
    FOREIGN KEY (billing_system_id) REFERENCES billing_system(id)
);

