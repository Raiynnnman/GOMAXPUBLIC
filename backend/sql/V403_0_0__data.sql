
use pain;
create table if not exists datastorage_tables(
    id INT PRIMARY KEY AUTO_INCREMENT, 
    name varchar(32)
);
create table if not exists datastorage_filters(
    id INT PRIMARY KEY AUTO_INCREMENT, 
    datastorage_tables_id int, 
    script text,
    FOREIGN KEY (datastorage_tables_id) REFERENCES datastorage_tables(id)
    
);
create table if not exists datastorage_columns(
    id INT PRIMARY KEY AUTO_INCREMENT, 
    datastorage_tables_id int, 
    name varchar(32),
    FOREIGN KEY (datastorage_tables_id) REFERENCES datastorage_tables(id)
);
alter table datastorage_columns add column (datatypes varchar(32));
create table if not exists datastorage_queries ( 
    id INT PRIMARY KEY AUTO_INCREMENT, name varchar(32), 
    query text, 
    created timestamp default CURRENT_TIMESTAMP,
    updated timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
insert into datastorage_queries (name, query) values ('Simple Weather Dataset', 'select avg(weather) from example');
create table if not exists datastorage_results( 
    id INT PRIMARY KEY AUTO_INCREMENT, 
    resultid varchar(255), 
    data text, 
    created timestamp default CURRENT_TIMESTAMP,
    updated timestamp default CURRENT_TIMESTAMP  ON UPDATE CURRENT_TIMESTAMP
);
insert into datastorage_queries (name, query) values ('Weather by Category', 'select category_text,avg(weather) from example group by category_text');
alter table datastorage_queries add column (rawquery int not null default 0, columns text, tables text, groupby text, orderby text, jointables text);
create table if not exists datastorage_dataset ( 
    id INT PRIMARY KEY AUTO_INCREMENT, 
    name varchar(32), 
    tblname varchar(32), 
    created timestamp default CURRENT_TIMESTAMP,
    updated timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table if not exists datastorage_objhash ( 
    objid varchar(128) unique, 
    tstamp timestamp default CURRENT_TIMESTAMP,
    created timestamp default CURRENT_TIMESTAMP,
    updated timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
alter table datastorage_filters add column (tblname varchar(128));
