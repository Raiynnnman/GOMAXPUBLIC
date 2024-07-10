
use pain;
alter table provider_queue_actions add column (duration int);
alter table provider_queue_actions add column (due_date TIMESTAMP);
alter table provider_queue_actions add column (end_date TIMESTAMP);
