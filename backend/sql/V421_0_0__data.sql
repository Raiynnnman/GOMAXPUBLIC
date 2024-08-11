
use pain;

set @v = (select id from datastorage_queries where name = 'Example01_Test');
insert into datastorage_dataset(name,query_id) values ('Example01_DS',@v);
set @l = LAST_INSERT_ID();
insert into datastorage_dataset_list (name,script,dataset_id) values (
    'Example01_DS_Script1',
    '
    def run(row):
        print("1:%s" % row)
    ',
    @l
);
insert into datastorage_dataset_list (name,script,dataset_id) values (
    'Example01_DS_Script2',
    '
    def run(row):
        print("2:%s" % row)
    ',
    @l
);
