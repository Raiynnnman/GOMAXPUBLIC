
use pain;


drop table support_queue_history;
drop table support_queue_comments;
drop table support_queue;

CREATE TABLE support_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    office_id INT,
    assignee_id INT,
    support_status_id INT NOT NULL DEFAULT 1,
    description VARCHAR(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (support_status_id) REFERENCES support_status(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

CREATE TABLE support_queue_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    support_queue_id INT,
    office_id INT,
    assignee_id INT,
    support_status_id INT,
    description VARCHAR(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (support_queue_id) REFERENCES support_queue(id),
    FOREIGN KEY (support_status_id) REFERENCES support_status(id),
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- Creating support_queue_comments table
CREATE TABLE support_queue_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    support_queue_id INT,
    user_id INT,
    text mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uuid VARCHAR(255) UNIQUE,
    FOREIGN KEY (support_queue_id) REFERENCES support_queue(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
