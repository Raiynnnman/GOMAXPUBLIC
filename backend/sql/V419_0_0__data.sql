
use pain;
delete from datastorage_queries;
delete from datastorage_columns;
delete from datastorage_tables;

create table if not exists datastorage_queries_history (
    datastorage_queries_id int,
    user_id int,
    changes mediumtext,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into datastorage_tables (name) values ('example01');
set @v = LAST_INSERT_ID();
insert into datastorage_queries (name,columns,tables,groupby,orderby,jointables,whereclause)
values 
(
    'Example01_Test',
    '["objid","city","state","zipcode","lat","lon"]',
    '["example01"]',
    '[]',
    '[]',
    '[]',
    '[]'
);
