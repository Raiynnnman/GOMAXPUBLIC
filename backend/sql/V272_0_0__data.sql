
use pain;
alter table chat_rooms add column (
    client_intake_id int,
    client_intake_offices_id int,
    FOREIGN KEY (client_intake_id) REFERENCES client_intake(id),
    FOREIGN KEY (client_intake_offices_id) REFERENCES client_intake_offices(id)
);
