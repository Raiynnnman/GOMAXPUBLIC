
use pain;
alter table client_intake drop pics_of_damange;
alter table client_intake add column (pics_of_damage int not null default 0);
