
use pain;
create table datastorage_dataset_registry (
    id int primary key auto_increment, 
    name varchar(255) unique, 
    tblname varchar(255)
);
alter table datastorage_dataset_registry add column (cols mediumtext);
