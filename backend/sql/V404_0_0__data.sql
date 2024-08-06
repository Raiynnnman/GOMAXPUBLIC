use pain;
create table if not exists datastorage_filter_list (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    filters_id int, 
    name varchar(32), 
    script text, 
    created timestamp default CURRENT_TIMESTAMP,
    updated timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

alter table datastorage_filters add column (name varchar(32));
alter table datastorage_filters add column (updated timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP); 
alter table datastorage_filters add column (created timestamp default CURRENT_TIMESTAMP);
alter table datastorage_filters add column (is_active int not null default 1);
create table if not exists datastorage_dataset_list (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    filters_id int, 
    name varchar(32), 
    script text, 
    created timestamp default CURRENT_TIMESTAMP,
    updated timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 

alter table datastorage_dataset add column (query_id int);
alter table datastorage_dataset drop column tblname;
alter table datastorage_dataset add column (is_active int not null default 1);
alter table datastorage_dataset_list drop column filters_id;
alter table datastorage_dataset_list add column (dataset_id int);
alter table datastorage_queries add column (whereclause text);
alter table datastorage_results add column (name varchar(64));
alter table datastorage_objhash add column (tbl varchar(64));
create table datastorage_result_rows (id INT PRIMARY KEY AUTO_INCREMENT, resultid int, data mediumtext);
alter table datastorage_result_rows add column (itemorder int);
alter table datastorage_results add column (jobid int);


