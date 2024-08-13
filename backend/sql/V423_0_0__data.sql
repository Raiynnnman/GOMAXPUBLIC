
create table if not exists office_emails (
    id int primary key auto_increment,
    office_id int,
    email varchar(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into office_emails (office_id,email) 
    select id,email from office where active = 1 and email is not null; 

insert into office_emails (office_id,email) 
    select ou.office_id,u.email from users u, office_user ou, office o
    where o.active = 1 and u.id=ou.user_id and ou.office_id = o.id and o.email is not null; 

insert into office_emails (office_id,email) values (19967,'doc1jrg@comcast.net');
insert into office_emails (office_id,email) values (19967,'dcopslbiz@att.net');

alter table office_emails add column (deleted int not null default 0);

alter table office_emails add column (description varchar(255));
update office_emails set description='Untitled';
