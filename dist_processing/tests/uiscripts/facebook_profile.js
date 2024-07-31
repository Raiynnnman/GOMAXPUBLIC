
var result = {};
var profile_id = '';
var inputData = input["data"];
add_log("TESTING");
if (inputData["profile"]) {
     add_log("pushing");
     var rs = {};
     rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_profile"};
     var mydata = inputData["profile"];
     profile_id = inputData["profile"]["identifier"]
     mydata["objid"] = profile_id
     // take this out for now, its broken
     if (mydata["reviews"]) { delete mydata["reviews"]; } 
     rs['data'] = mydata;
     add_data(rs) 
}
