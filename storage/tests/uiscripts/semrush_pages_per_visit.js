
 var inputData = input["data"];
 if (!inputData["pagesPerVisit"]){ return; }
 var c = 0;
 for (c=0; c<inputData["pagesPerVisit"].length;c++) {
     var dat = inputData["pagesPerVisit"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_pages_per_visit"}, data:dat});
 };
 