
use pain;
alter table referrer_users add column (
    referrer_documents_id int,
    FOREIGN KEY (office_id) REFERENCES office(id)
);

alter table referrer_users drop column updated;
alter table referrer_users add column (updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);

alter table referrer_documents drop column updated;
alter table referrer_documents add column (updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
