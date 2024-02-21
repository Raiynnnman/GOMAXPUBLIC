
use pain;

create table registration_types (
    id int primary key auto_increment,
    name varchar(255)
);

insert into registration_types (id,name) values
(1,'Provider'),
(2,'Legal'),
(3,'Customer');

create table registrations (
    id int primary key auto_increment,
    registration_types_id int,
    email varchar(255),
    first_name varchar(255),
    last_name varchar(255),
    verified int not null default 0,
    phone varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_types_id) REFERENCES registration_types(id)
);
