
var ident = input["data"]["profile"]["id"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["tweets"].length;c++) { 
    var thispost = inputData["tweets"][c];
    var rs = {};
    var objid = thispost["id"];
    thispost["objid"] = objid;
    delete thispost["timestamp"];
    delete thispost["photos"];
    delete thispost["thumbnail"];
    rs["action"] = {action:"ADD_TO_TABLE",table:"twitter_tweet"};
    rs["data"] = thispost;
    add_data(rs);
};
