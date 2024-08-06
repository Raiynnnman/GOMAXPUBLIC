
 var inputData = input["data"];
 if (!inputData["uniqueVisitors"]){ return; }
 var c = 0;
 for (c=0; c<inputData["uniqueVisitors"].length;c++) {
     var dat = inputData["uniqueVisitors"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_unique_visitors"}, data:dat});
 };
 