
delete from office_emails where email in (select email from office);
delete from office_emails where email in (select email from users);
