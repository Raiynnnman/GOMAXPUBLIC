if(!input["data"]["profile"]){
    return;
}
var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) { 
    var thispost = inputData["recent_posts"][c];
    var comments_full = JSON.parse(JSON.stringify(thispost["comments_full"])); // make a copy
    var objid = thispost["post_id"];
    thispost['objid'] = objid;
    var d = 0;
    for (d = 0; d < comments_full.length; d++) { 
          var cf = comments_full[d]
          cf['parent_id'] = objid;
          var rs = {}
          rs['action'] = {action:"ADD_TO_TABLE",table:"facebook_comments"};
          rs['data'] = cf
          add_data(rs);
    }
}
