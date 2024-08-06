
insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values ('scraping', 'Scraping Data');
Insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(), 
'
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData.length;c++) {
    add_log("c="+c);
    var dat = inputData[c]; 
    var table = "scraping";
    if (dat["domain"]) { 
        table = "scraping_" + dat["domain"];
        table = table.replace(".","_");
        table = table.replace(".","_");
        table = table.replace("-","_");
    }
    add_data({action:{action:"ADD_TO_TABLE", table: table}, data:dat});
};
',
'');


