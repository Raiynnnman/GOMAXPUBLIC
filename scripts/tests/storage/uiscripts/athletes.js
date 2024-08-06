

var inputData = input["data"];

if (inputData["parent_id"]) { return; }
if (!inputData["players"]) { return; }

var c = 0;
for (c=0; c<inputData["players"].length;c++) {
   var profile = inputData["players"][c];
   var objid = profile["id"]
   var cf = profile
    cf['objid'] = objid;
    var rs = {}
    rs['action'] = {action:"ADD_TO_TABLE",table:"athletes"};
    rs['data'] = cf
    add_data(rs);
}
