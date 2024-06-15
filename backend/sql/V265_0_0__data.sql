-- Create the office_notifications_category table
CREATE TABLE office_notifications_category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255)
);
INSERT INTO office_notifications_category (id, name) VALUES (1, 'OFFICE_NOTIFICATION_NO_ADDRESSES');
INSERT INTO office_notifications_category(id, name) VALUES (2, 'OFFICE_NOTIFICATION_HAS_ADDRESSES');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_NEW_MESSAGE');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_MEETING_REMINDER');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_SYSTEM_UPDATE');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_SECURITY_ALERT');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_POLICY_CHANGE');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_BIRTHDAY_REMINDER');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_EVENT_INVITE');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_TASK_DEADLINE');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_HOLIDAY_REMINDER');
INSERT INTO office_notifications_category(name) VALUES ('OFFICE_NOTIFICATION_NEW_ASSIGNMENT');
-- Create the office_notifications table with polymorphic references to differnet entities like user , office , providers or physicians we'd just need to add forign keys to the table to reference the differnt tables.
CREATE TABLE office_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    office_id INT,
    office_notifications_category_id INT,
    notifiable_id INT,
    notifiable_type VARCHAR(255),
    acknowledged INT NOT NULL DEFAULT 0,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (office_notifications_category_id) REFERENCES office_notifications_category(id)
);                                                                                                                                                                                                               