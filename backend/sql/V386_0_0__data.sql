
use pain;
alter table office_phones add column (description varchar(255));
update office_phones set description='Untitled';
