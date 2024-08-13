
delete from office_emails;
insert into office_emails (office_id,email) 
    select id,email from office where email is not null; 

insert into office_emails (office_id,email) 
    select ou.office_id,u.email from users u, office_user ou, office o
    where u.id=ou.user_id and ou.office_id = o.id and o.email is not null;  

insert into office_emails (office_id,email) values (19967,'doc1jrg@comcast.net');
insert into office_emails (office_id,email) values (19967,'dcopslbiz@att.net');
