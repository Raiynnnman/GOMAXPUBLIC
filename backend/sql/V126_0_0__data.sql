
use pain;
alter table search_no_results add column (zipcode varchar(255),ret_size int not null default 0);
