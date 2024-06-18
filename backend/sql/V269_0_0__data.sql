
use pain;
create table chat_rooms (
    id int primary key auto_increment,
    name varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    
);

create table chat_room_invited (
    chat_rooms_id int,
    user_id int,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

create table chat_room_discussions (
    chat_rooms_id int,
    from_user_id int,
    to_user_id int,
    text mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (chat_rooms_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id)
);
