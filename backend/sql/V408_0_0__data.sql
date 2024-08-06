
use pain;
alter table datastorage_objhash add column (schema_version int not null default 0);
