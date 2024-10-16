

create table family_tracker (
    id int primary key auto_increment,
    user_id int,
    name varchar(255),
    enabled int not null default 1,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)

);

create table family_tracker_codes (
    id int primary key auto_increment,
    family_tracker_id int,
    code varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (family_tracker_id) REFERENCES family_tracker(id)
);

create table family_tracker_members (
    id int primary key auto_increment,
    family_tracker_id int,
    user_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (family_tracker_id) REFERENCES family_tracker(id),
    FOREIGN KEY (user_id) REFERENCES users(id)

);
