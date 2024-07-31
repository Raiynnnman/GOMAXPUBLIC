if(!input["data"]["profile"]){
    return;
}
var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) {
    var thispost = inputData["recent_posts"][c];
    var ilq = JSON.parse(JSON.stringify(thispost["images_lowquality"])); // make a copy
    var ilqd = JSON.parse(JSON.stringify(thispost["images_lowquality_description"])); 
    var objid = thispost["post_id"];
    thispost['objid'] = objid;
    var d = 0;
    for (d = 0; d < ilq.length; d++) {
          var cf = {"image_link": ilq[d], "image_description":ilqd[d]} 
          cf['parent_id'] = objid;
          var rs = {}
          rs['action'] = {action:"ADD_TO_TABLE",table:"facebook_images"};
          rs['data'] = cf
          add_data(rs);
    }
}
