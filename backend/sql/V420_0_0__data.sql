

use pain;
delete from datastorage_queries;
delete from datastorage_columns;
delete from datastorage_tables;

insert into datastorage_tables (name) values ('example01');
set @v = LAST_INSERT_ID();
insert into datastorage_queries (name,columns,tables,groupby,orderby,jointables,whereclause)
values 
(
    'Example01_Test',
    '[{"table":"example01","field":"objid","function":null},{"table":"example01","field":"city","function":null},{"table":"example01","field":"state","function":null},{"table":"example01","field":"zipcode","function":null},{"table":"example01","field":"lat","function":null},{"table":"example01","field":"lon","function":null}]',
    '["example01"]',
    '[]',
    '[]',
    '[]',
    '[]'
);
