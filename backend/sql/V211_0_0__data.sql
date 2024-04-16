
use pain;
alter table office_plans add column (
    coupons_id int,
    FOREIGN KEY (coupons_id) REFERENCES coupons(id)
);
    
