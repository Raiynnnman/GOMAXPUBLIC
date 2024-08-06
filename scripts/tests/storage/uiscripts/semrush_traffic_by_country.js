
 var inputData = input["data"];
 if (!inputData["trafficByCountry"]){ return; }
 var c = 0;
 for (c=0; c<inputData["trafficByCountry"].length;c++) {
     var dat = inputData["trafficByCountry"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_traffic_by_country"}, data:dat});
 };
 