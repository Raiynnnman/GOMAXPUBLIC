
use pain;

update office_type set name = 'Chiropractor' where id = 1;

create table office_type_descriptions (
    office_type_id int,
    name varchar(25),
    description varchar(255),
    FOREIGN KEY (office_type_id) REFERENCES office_type(id)
);

insert into office_type_descriptions (office_type_id,name,description) values
(1,'Chiropractor','I need a Chiropractor'),
(2,'Legal','I need Legal Help');
