
drop table if exists support_queue_history;
drop table if exists support_queue_comments;
drop table if exists support_status;
drop table if exists support_queue;

create table support_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name varchar(255)
);

create table support_urgency (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name varchar(255)
);

insert into support_urgency (id,name) values
(1,'Low'),
(10,'Medium'),
(30,'High'),
(100,'Urgent');

INSERT INTO support_status (id,name)
VALUES 
    (1,'Open'),
    (20,'In Progress'),
    (30,'Review'),
    (40,'Escalated'),
    (100,'Closed');

CREATE TABLE support_queue (
    id int primary key auto_increment,
    uuid varchar(64),
    office_id int,
    assignee_id int,
    support_status_id int,
    support_urgency_id int,
    description VARCHAR(512),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (support_status_id) REFERENCES support_status(id),
    FOREIGN KEY (support_urgency_id) REFERENCES support_urgency(id),
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

CREATE TABLE support_queue_comments (
    id int PRIMARY KEY AUTO_INCREMENT,
    support_queue_id int,
    user_id int,
    text mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uuid VARCHAR(255) UNIQUE,
    FOREIGN KEY (support_queue_id) REFERENCES support_queue(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
