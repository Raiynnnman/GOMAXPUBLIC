
use pain;
alter table online_demo_meetings add column (description varchar(255));
update online_demo_meetings set description = '';
