
var profile_id = "";
var inputData = input["data"];
add_log("TESTING");
if (inputData["profile"]) {
     add_log("pushing");
     var rs = {};
     rs["action"] = {action:"ADD_TO_TABLE",table:"twitter_profile"};
     var mydata = inputData["profile"];
     profile_id = inputData["profile"]["id"];
     mydata["objid"] = profile_id;
     rs['data'] = mydata;
     add_data(rs);
};