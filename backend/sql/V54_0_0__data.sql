
use pain;
alter table office_plans add column (
    pricing_data_id int,
    FOREIGN KEY (pricing_data_id) REFERENCES pricing_data(id)
);
