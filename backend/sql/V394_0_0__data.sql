use pain;

ALTER TABLE support_queue
ADD COLUMN urgency VARCHAR(50);
CREATE TABLE urgency_levels (
    id SERIAL PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL
);
INSERT INTO urgency_levels (level_name) VALUES
('Low'),
('Medium'),
('High'),
('Critical');