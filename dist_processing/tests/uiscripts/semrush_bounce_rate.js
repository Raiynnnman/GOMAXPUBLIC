
 var inputData = input["data"];
 if (!inputData["bounceRate"]){ return; }
 var c = 0;
 for (c=0; c<inputData["bounceRate"].length;c++) {
     var dat = inputData["bounceRate"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_bounce_rate"}, data:dat});
 };
 