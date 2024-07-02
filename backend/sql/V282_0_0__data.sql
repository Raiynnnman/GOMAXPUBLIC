
use pain;
drop table provider_queue_history;

insert into provider_queue_status (id,name) values
(12,'BACK_BURNER');

update provider_queue_status set name = 'CLOSED_WON' where id = 20;
