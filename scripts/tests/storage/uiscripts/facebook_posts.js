if(!input["data"]["profile"]){
    return;
}
var ident = input["data"]["profile"]["identifier"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["recent_posts"].length;c++) { 
    var thispost = inputData["recent_posts"][c];
    var comments_full = JSON.parse(JSON.stringify(thispost["comments_full"])); // make a copy
    delete thispost["comments_full"]; // Remove it and process after
    /* Images */
    var image_ids = JSON.parse(JSON.stringify(thispost["image_ids"]));
    delete thispost["image_ids"];
    var images_lowquality = JSON.parse(JSON.stringify(thispost["images_lowquality"]));
    delete thispost["images_lowquality"];
    var images_lowquality_description = JSON.parse(JSON.stringify(thispost["images_lowquality_description"]));
    delete thispost["images_lowquality_description"];
    /* Reactions */
    var reactions = JSON.parse(JSON.stringify(thispost["reactions"]));
    delete thispost["reactions"];
    var reactors = JSON.parse(JSON.stringify(thispost["reactors"]));
    delete thispost["reactors"];
    var wth = JSON.parse(JSON.stringify(thispost["with"]));
    delete thispost["with"];
    var rs = {}
    var objid = thispost["post_id"];
    thispost['objid'] = objid;
    rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_post"};
    rs["data"] = thispost;
    add_data(rs);
}
