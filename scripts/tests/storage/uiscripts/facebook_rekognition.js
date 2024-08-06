
 var inputData = input["data"]
 if(!inputData["commenter_id"]){
     return;
 }
 var rs = {};
 rs["objid"] = inputData["commenter_id"]
 rs["action"] = {action:"ADD_TO_TABLE",table:"facebook_rekognition"};
 rs["data"] = inputData["data"];
 add_data(rs);
 
 