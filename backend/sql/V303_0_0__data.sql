
use pain;
alter table provider_queue_actions drop column action;
alter table provider_queue_actions add column (
    attendees varchar(512),
    subject varchar(512),
    body mediumtext
);
