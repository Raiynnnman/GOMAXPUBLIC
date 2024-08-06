
 var inputData = input["data"];
 if (!inputData["organicWordSearch"]){ return; }
 var c = 0;
 for (c=0; c<inputData["organicWordSearch"].length;c++) {
     var dat = inputData["organicWordSearch"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_organic_word_search"}, data:dat});
 };
 