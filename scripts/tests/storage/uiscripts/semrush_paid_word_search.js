
 var inputData = input["data"];
 if (!inputData["paidWordSearch"]){ return; }
 var c = 0;
 for (c=0; c<inputData["paidWordSearch"].length;c++) {
     var dat = inputData["paidWordSearch"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_paid_word_search"}, data:dat});
 };
 