
 var inputData = input["data"];
 if (!inputData["trafficSources"]){ return; }
 var c = 0;
 for (c=0; c<inputData["trafficSources"].length;c++) {
     var dat = inputData["trafficSources"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_traffic_sources"}, data:dat});
 };
 