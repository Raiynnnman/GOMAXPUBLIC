
use pain;
alter table client_intake_offices add column (
    phy_id int,
    FOREIGN KEY (phy_id) REFERENCES users(id)
);

update client_intake_offices set phy_id = 105;
