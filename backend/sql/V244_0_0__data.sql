
use pain;
delete from referrer_documents;
delete from referrer_users;
delete from referrer_users_status;

insert into referrer_users_status (id,name) values
(1,'QUEUED'),
(10,'REJECTED'),
(20,'ACCEPTED'),
(30,'CONTACTED'),
(40,'FOLLOWUP'),
(50,'SCHEDULED'),
(60,'COMPLETED');
