
 var inputData = input["data"];
 if (!inputData["trafficDestinations"]){ return; }
 var c = 0;
 for (c=0; c<inputData["trafficDestinations"].length;c++) {
     var dat = inputData["trafficDestinations"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_traffic_destinations"}, data:dat});
 };
 