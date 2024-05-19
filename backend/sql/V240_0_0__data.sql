
use pain;


create table languages (
    id int primary key auto_increment,
    name varchar(255)
);

insert into languages (id,name) values 
(1, 'English'),
(2, 'Spanish');

alter table client_intake add column (
    languages_id int,
    FOREIGN KEY (languages_id) REFERENCES languages(id)
);

update client_intake set languages_id=1;

create table office_languages(
    id int primary key auto_increment,
    office_id int,
    languages_id int,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES office(id),
    FOREIGN KEY (languages_id) REFERENCES languages(id)

);

insert into office_languages (office_id,languages_id) 
    select id,1 from office where active = 1;
