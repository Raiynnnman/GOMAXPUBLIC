
use pain;

create table online_demo_meetings (
    id int primary key auto_increment,
    meeting_id varchar(255) unique,
    url varchar(255),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

