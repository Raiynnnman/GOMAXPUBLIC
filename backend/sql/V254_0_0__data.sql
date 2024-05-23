
use pain;

alter table provider_queue add column (do_not_contact int not null default 0);
