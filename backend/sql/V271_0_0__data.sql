
use pain;
drop table chat_room_invited;
drop table chat_room_discussions;
drop table chat_rooms;

create table chat_rooms (
    id int primary key auto_increment,
    label varchar(255),
    name varchar(255),
    office_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id)
);

create table chat_room_invited (
    chat_rooms_id int,
    user_id int,
    office_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

create table chat_room_discussions (
    chat_rooms_id int,
    from_user_id int,
    user_id int,
    to_user_id int,
    to_office_id int,
    text mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_rooms_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (to_office_id) REFERENCES office(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id)
);

