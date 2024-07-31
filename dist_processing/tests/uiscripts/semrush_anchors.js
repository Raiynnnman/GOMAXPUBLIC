
 var inputData = input["data"];
 if (!inputData["anchors"]){ return; }
 var c = 0;
 for (c=0; c<inputData["anchors"].length;c++) {
     var dat = inputData["anchors"][c]; 
     add_data({action:{action:"ADD_TO_TABLE", table: "semrush_anchors"}, data:dat});
 };
 