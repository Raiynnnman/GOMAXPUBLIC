
 var inputData = input["data"];
 if (!inputData["visitDuration"]){ return; }
 var c = 0;
 for (c=0; c<inputData["visitDuration"].length;c++) {
     var dat = inputData["visitDuration"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_avg_visit_duration"}, data:dat});
 };
 