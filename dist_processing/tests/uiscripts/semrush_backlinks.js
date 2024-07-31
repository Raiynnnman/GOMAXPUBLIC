var inputData = input["data"];

if (inputData["parent_id"]){ return; }
if (!inputData["backlinks"]){ return; }

var c = 0;
for (c=0; c<inputData["backlinks"].length;c++) {
    var backlinks = inputData["backlinks"][c]; 
    var cf = backlinks;
    var rs = {};
    rs["action"] = {action:"ADD_TO_TABLE",table:"semrush_backlinks"};
    rs["action"]["data"] = cf;
    add_data(rs);
};
