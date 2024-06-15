
use pain;
alter table client_intake_offices add column (
    client_intake_status_id int,
    FOREIGN KEY (client_intake_status_id) REFERENCES client_intake_status(id)
);
    
