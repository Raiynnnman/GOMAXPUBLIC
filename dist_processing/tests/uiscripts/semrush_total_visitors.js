
 var inputData = input["data"];
 if (!inputData["totalVisitors"]){ return; }
 var c = 0;
 for (c=0; c<inputData["totalVisitors"].length;c++) {
     var dat = inputData["totalVisitors"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_total_visitors"}, data:dat});
 };
 