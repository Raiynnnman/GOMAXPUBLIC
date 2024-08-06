
var ident = input["data"]["profile"]["id"];
var inputData = input["data"];
var c = 0;
for (c=0; c<inputData["tweets"].length;c++) { 
    var thispost = inputData["tweets"][c];
    var rs = {};
    var objid = thispost["id"];
    var photos = JSON.parse(JSON.stringify(thispost["photos"]));
    var thumbnail = JSON.parse(JSON.stringify(thispost["thumbnail"]));
    thispost["objid"] = objid;
    if( photos !== []){
        var d = 0;
        for (d = 0; d < photos.length; d++) {
            var cf = {
                "image_link": photos[d],
                "parent_id": objid
            };
            var rs = {};
            rs["action"] = {action:"ADD_TO_TABLE",table:"twitter_images"};
            rs["data"] = cf;
            add_data(rs);
        };
    };
    if(thumbnail !== ""){
        var cf = {
            "tumbnail": thumbnail,
            "parent_id": objid
        };
        var rs = {};
        rs["action"] = {action:"ADD_TO_TABLE",table:"twitter_images"};
        rs["data"] = cf;
        add_data(rs);
    };
};
