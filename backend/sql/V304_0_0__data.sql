
use pain;
alter table provider_queue_actions add column 
(
    online int not null default 0,
    start_timezone varchar(255),
    end_timezone varchar(255)
);
