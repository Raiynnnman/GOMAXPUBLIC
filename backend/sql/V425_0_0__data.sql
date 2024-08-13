
create index office_emails_index on office_emails(email);
delete from office_emails where email in (select email from office);
delete from office_emails where email in (select email from users);
