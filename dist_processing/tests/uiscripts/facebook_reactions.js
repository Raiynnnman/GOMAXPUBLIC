if(!input["data"]["profile"]){
    return;
}

var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) { 
    var thispost = inputData["recent_posts"][c];
    var react = JSON.parse(JSON.stringify(thispost["reactions"])); // make a copy
    if (!react) { continue; } 
    var objid = thispost["post_id"];
    var d = 0;
    for (d = 0; d < react.length; d++) { 
          var cf = react[d]
          cf['parent_id'] = objid;
          var rs = {}
          rs['action'] = {action:"ADD_TO_TABLE",table:"facebook_reactions"};
          rs['data'] = cf
          add_data(rs);
    }
}
