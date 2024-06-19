
use pain;
drop table chat_room_invited;
drop table chat_room_discussions;
drop table chat_rooms;

create table chat_rooms (
    id int primary key auto_increment,
    name varchar(255),
    client_intake_id int,
    client_intake_offices_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP on UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_intake_id) REFERENCES client_intake(id),
    FOREIGN KEY (client_intake_offices_id) REFERENCES client_intake_offices(id)
    
);

create table chat_room_invited (
    id int primary key auto_increment,
    chat_rooms_id int,
    user_id int,
    office_id int,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (chat_rooms_id) REFERENCES chat_rooms(id),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP on UPDATE CURRENT_TIMESTAMP
);

create table chat_room_discussions (
    id int primary key auto_increment,
    chat_rooms_id int,
    from_user_id int,
    to_user_id int,
    to_office_id int,
    text mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (chat_rooms_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (to_office_id) REFERENCES office(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id)
);
