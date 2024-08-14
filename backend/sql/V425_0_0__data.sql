use pain;

INSERT INTO support_status (status_name)
VALUES 
    ('Open'),
    ('In Progress'),
    ('Review'),
    ('Closed');

ALTER TABLE support_queue
ADD COLUMN urgency_id INT;

ALTER TABLE support_queue
ADD COLUMN ticket_name VARCHAR(255);
