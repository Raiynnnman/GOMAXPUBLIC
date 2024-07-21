
use pain;
alter table traffic_incidents_contact add column (contacted TIMESTAMP);
alter table traffic_incidents_contact add column (
    client_intake_status_id int,
    FOREIGN KEY (client_intake_status_id) REFERENCES client_intake_status(id)
);
